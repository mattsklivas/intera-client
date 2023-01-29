import useSWR from 'swr'
import hookFetcher from '../core/hookFetcher'

// Fetch a room's info
export default function useRoomInfo(roomID, token) {
    return useSWR(() => {
        if (roomID && token) {
            return [`/api/rooms/get_room_info?room_id=${roomID}`, token]
        }
        return undefined
    }, hookFetcher)
}
