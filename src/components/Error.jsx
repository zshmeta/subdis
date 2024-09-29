// an error page that dispay an error message then returns to / after 3 sec

import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
    const navigate = useNavigate();
    
    setTimeout(() => {
        navigate('/');
    }, 3000);
    
    return (
        <div>
        <h1>Oops! Something went wrong.</h1>
        <p>Returning to the main page in 3 seconds...</p>
        </div>
    );
    }

export default ErrorPage;