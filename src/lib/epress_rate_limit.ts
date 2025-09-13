import {rateLimit} from 'express-rate-limit'

const limiter = rateLimit({
    windowMs:60000, //1 minute window for req limiting
    limit:60, // Allow a max of 60 req per window per IP
    standardHeaders:'draft-8', // User latest standard rate-limit headers
    legacyHeaders:false, // Disable deprecated X-Ratelimit headers
    message:{
        error: 'You have too many requests in a given time. Please try again later'
    }
})

export default limiter