const API_URL = process.env.API_URL || 'http://127.0.0.1:5000'
const CLIENT_URL = process.env.CLIENT_URL || '0.0.0.0:3000'

export default function fetcher(token, url, options) {
    const headers = new Headers({
        Authorization: `Bearer ${token}`,
        Origin: CLIENT_URL,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    })

    url = `${API_URL}${url}`

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: options.method,
            headers: headers,
        })
            .then(async (response) => {
                if (!response.ok || response.status == 401) {
                    const res = await response.json()
                    return reject(res)
                } else {
                    const res = await response.json()
                    return resolve(res)
                }
            })
            .catch((err) => {
                return reject(err)
            })
    })
}
