import useSWR from 'swr'
import { hookFetcher } from '../core/fetchers'

// Fetch past transcripts for a given user
export default function useTranscriptHistory(nickname, token) {
    return useSWR(() => {
        if (nickname && token) {
            return [`/api/rooms/get_all_rooms_by_user?user_id=${nickname}`, token]
        }
        return undefined
    }, hookFetcher)
}
