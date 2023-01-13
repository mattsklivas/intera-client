export default function hookFetcher(props) {
    let url = props[0]
    const token = props[1]

    const headers = new Headers({
        Authorization: `Bearer ${token}`,
        Origin: process.env.CLIENT_URL,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    })

    url = `${process.env.API_URL}${url}`

    return fetch(url, headers)
        .then(async (res) => {
            return res.json()
        })
        .then(async (res) => {
            return res.data
        })
}
