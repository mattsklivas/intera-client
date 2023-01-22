export default async function hookFetcher(props) {
    let url = props[0]
    const token = props[1]

    const headers = new Headers({
        Authorization: `Bearer ${token}`,
        Origin: process.env.CLIENT_URL,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    })

    url = `${process.env.API_URL}${url}`

    return await fetch(url, { headers: headers })
        .then(async (res) => {
            return res.json()
        })
        .then(async (res) => {
            // If the user's token has expired, throw
            if (res.status == 401) {
                const error = new Error(res?.error || 'An unknown error has occured.')
                error.status = res.status
                throw error
            }

            return res.data
        })
        .catch(async (err) => {
            throw err
        })
}
