const API_URL = process.env.API_URL || 'http://127.0.0.1:5000'

export default function fetcher(token, url, options) {
    const authHeader = new Headers({ Authorization: `Bearer ${token}` })
    url = `${API_URL}${url}`

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: options.method,
            headers: authHeader,
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
