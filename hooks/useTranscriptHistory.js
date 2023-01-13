import useSWR from 'swr'
import hookFetcher from '../core/hookFetcher'

// Fetch past transcripts for a given user
function useTranscriptHistory(nickname, token) {
    return useSWR(() => {
        if (nickname && token) {
            return [`/api/rooms/get_all_rooms_by_id?user_id=${nickname}`, token]
        }
        return undefined
    }, hookFetcher)
}

// Export the hook
export default useTranscriptHistory
