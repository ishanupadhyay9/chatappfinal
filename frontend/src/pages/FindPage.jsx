import React from 'react'
import { useState } from 'react'
import { UserCheckIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import { findFriend, sendFriendRequest } from '../lib/api';
import NoFriendsFound from '../components/NoFriendsFound';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';
const FindPage = () => {
    const [ref, setRef] = useState(""); // Fixed: camelCase naming
    const [searchData, setSearchData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // Add this to track if search was performed
    const { authUser } = useAuthUser();
    const myId = authUser._id;
    const [userId, setUserId]= useState("");
    const queryClient = useQueryClient();
    
    const { mutate: sendRequestMutation, isPending } = useMutation({
        mutationFn: sendFriendRequest({myId:myId,userId:userId}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
            toast.success("Friend request sent successfully");
        },
        onError: (error) => {
            console.error('Error sending friend request:', error);
            // Handle error (show toast, etc.)
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ref.trim()) return; // Don't search if input is empty
        
        setLoading(true);
        setHasSearched(true);
        
        try {
            const response = await findFriend({ ref: ref.trim() });
            console.log('API Response:', response);
            
            // Handle different possible response structures
            const users = response?.data?.users || response?.users || [];
            setSearchData(users);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchData([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4">
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 mb-6"
            >
                <input
                    type="text"
                    value={ref}
                    placeholder="Search by name or ID..."
                    onChange={(e) => setRef(e.target.value)}
                    className="flex-1 px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <button
                    type="submit"
                    aria-label="Search"
                    disabled={loading || !ref.trim()}
                    className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white border-none rounded cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Search size={20} />
                </button>
            </form>

            <div>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : hasSearched ? (
                    searchData && searchData.length > 0 ? (
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <UserCheckIcon className="h-5 w-5 text-blue-600" />
                                Search Results
                                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm ml-2">
                                    {searchData.length}
                                </span>
                            </h2>

                            <div className="space-y-3">
                                {searchData.map((user) => (
                                    <div
                                        key={user._id}
                                        className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                                    {user.profilePic ? (
                                                        <img 
                                                            src={user.profilePic} 
                                                            alt={user.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                            {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                                                    <p className="text-sm text-gray-500">@{user.username || 'user'}</p>
                                                </div>
                                            </div>

                                            <button
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors"
                                                onClick={() =>{setUserId(user._id); sendRequestMutation()}}
                                                disabled={isPending}
                                            >
                                                {isPending ? 'Sending...' : 'Send Request'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <NoFriendsFound />
                    )
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>Search for friends by name or ID</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FindPage
