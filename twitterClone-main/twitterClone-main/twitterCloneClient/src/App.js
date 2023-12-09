import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LoginPage } from './Pages/LoginPage';
import { RegisterPage } from './Pages/RegisterPage';
import { HomePage } from './Pages/HomePage';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { EXPLORE, HOME, PROFILE, URL_GRAPHQL, URL_PROFILE_USERNAME } from './Shared/Constants';
import { IsAuthenticated } from './Shared/IsAuthenticated';
import { ProfilePage } from './Pages/ProfilePage';
import { ExplorePage } from './Pages/ExplorePage';

function App() {
	const apolloClient = new ApolloClient({
		uri: URL_GRAPHQL,
		cache: new InMemoryCache()
	})
	return (
		<ApolloProvider client={apolloClient} >	
			<BrowserRouter>
				<Routes>
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />
					<Route path={`/${HOME}`} element={<IsAuthenticated><HomePage /></IsAuthenticated>} />
					<Route path={`/${PROFILE}/:${URL_PROFILE_USERNAME}`} element={<IsAuthenticated><ProfilePage /></IsAuthenticated>} />
					<Route path={`/${PROFILE}/`} element={<IsAuthenticated><ProfilePage /></IsAuthenticated>} />
					<Route path={`/${EXPLORE}/`} element={<IsAuthenticated><ExplorePage /></IsAuthenticated>} />
					<Route path='/' element={<LoginPage />} />
				
					<Route path='*' element={<div>Page not found</div>} />
				</Routes>
			</BrowserRouter>
		</ApolloProvider>
	);
}

export default App;
