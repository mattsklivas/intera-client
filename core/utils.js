function getQuery(router, key) {
    return router.query[key] || router.asPath.match(new RegExp(`[&?]${key}=(.*)(&|$)`))
}

export { getQuery }
