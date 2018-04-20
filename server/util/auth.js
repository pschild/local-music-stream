module.exports = (authToken) => {
    if (!authToken) {
        return false;
    }

    authToken = authToken.replace(/^Basic /, '');
    const authTokenFromServerEnvironment = Buffer.from(`${process.env.LMS_USERNAME}:${process.env.LMS_PASSWORD}`).toString('base64');
    return authToken === authTokenFromServerEnvironment;
};