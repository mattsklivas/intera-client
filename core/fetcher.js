export default function fetcher(token, url, options) {
    const headers = new Headers({
        Authorization: `Bearer ${token}`,
        Origin: process.env.CLIENT_URL,
        Accept: 'application/json',
        'Content-Type': 'application/json',
    })

    url = `${process.env.API_URL}${url}`

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: options.method,
            headers: headers,
        })
            .then(async (res) => {
                if (!res.ok || res.status == 401) {
                    const res = await res.json()
                    return reject(res)
                } else {
                    const res = await res.json()
                    return resolve(res)
                }
            })
            .catch((err) => {
                return reject(err)
            })
    })
}
