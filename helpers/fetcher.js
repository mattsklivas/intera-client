// used in practice-module

const API_URL = process.env.API_URL || 'http://127.0.0.1:5000'

const includeOptions = (token, options) => {
    const authHeaderField = new Headers({ Authorization: `Bearer ${token}` })
    const headerField = {
        method: options.method,
        headers: authHeaderField,
    }
    return headerField
}

export default function customFetch(token, url, options) {
    url = `${API_URL}${url}`
    return new Promise((resolve, reject) => {
        fetch(url, includeOptions(token, options))
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
