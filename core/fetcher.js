export default function fetcher(token, url, options, video = false) {
    const headers = new Headers(
        !video
            ? {
                  Authorization: `Bearer ${token}`,
                  Origin: process.env.CLIENT_URL,
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
              }
            : {
                  Authorization: `Bearer ${token}`,
                  Origin: process.env.CLIENT_URL,
                  Accept: 'application/json',
              }
    )

    url = `${process.env.API_URL}${url}`

    console.log(url)

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: options.method,
            body: options.body,
            headers: headers,
        })
            .then(async (res) => {
                if (!res.ok || res.status != 200) {
                    const data = await res.json()
                    return reject(data)
                } else {
                    const data = await res.json()
                    return resolve(data)
                }
            })
            .catch((err) => {
                return reject(err)
            })
    })
}
