import React, { useEffect, useRef, useState } from 'react';
import { 
    Container, 
    Paper, 
    Avatar, 
    Typography, 
    Button, 
    AppBar,Modal,TextField,
    Toolbar, 
    IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TopBar } from '../Components/TopBar';
import { useMutation, useQuery } from '@apollo/client';
import { PROFILE_FOR_USER, UPDATE_MY_PROFILE, FOLLOW_A_USER, MAKE_A_POST, UNFOLLOW_A_USER, DELETE_POST, UPDATE_MY_POST } from '../GraphQLQuery/queries';
import { AUTHORIZATION, JWT_ACCESS_TOKEN_KEY, URL_PROFILE_USERNAME } from '../Shared/Constants';
import { LoadingPage, Tweet } from '../Helpers/Utility';
import { Twitter } from '@mui/icons-material';

export function ProfilePage(props) {
    const navigate = useNavigate();
	const [updateProfileModalOpen, setUpdateProfileModalOpen] = useState(false);
	const [tweetModalOpen, setTweetModalOpen] = useState(false);
    const [updateTweet, setUpdateTweet] = useState({});
    const [updateTweetModalOpen, setUpdateTweetModalOpen] = useState(false);
    const params = useParams();
    const [updateMyProfileQL, {loading: updatingMyProfile, error: errorUpdatingMyProfile}] = useMutation(UPDATE_MY_PROFILE);
    const [followAUserQL, {loading: followAUserLoading, error: followAUserError}] = useMutation(FOLLOW_A_USER);
    const [unfollowAUserQL, {loading: unfollowAUserLoading, error: unfollowAUserError}] = useMutation(UNFOLLOW_A_USER);
    const [makeAPostQL, {loading: makeAPostLoading, error: makeAPostError}] = useMutation(MAKE_A_POST);
    const [updateMyPostQL, {loading: updateMyPostQLLoading, error: updateMyPostQLError}] = useMutation(UPDATE_MY_POST);
    const {data, loading, error, refetch: refetchProfile, client: apolloClient } = useQuery(PROFILE_FOR_USER, {
        variables: { input: params[URL_PROFILE_USERNAME] },
        context: {
            headers: {
                [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
            }
        }
    })
    const [deletePostQL, {loading: deleteLoading, error: deleteError}] = useMutation(DELETE_POST);
	const [name, setName] = useState('');
	const [bio, setBio] = useState('');
	const [username, setUsername] = useState('');
	const [numberOfPosts, setNumberOfPosts] = useState('');
	const [numberOfFollowers, setNumberOfFollowers] = useState('');
	const [numberOfFollowing, setNumberOfFollowing] = useState('');
    const [isMyProfile, setIsMyProfile] = useState(null)
    const [isFollowingThisProfile, setIsFollowingThisProfile] = useState(null);
    const [profilePosts, setProfilePosts] = useState([]);
    const [disableButtons, setDisableButtons] = useState(false);
    useEffect(() => {
        console.log('errors', error)
        if(error)
            navigate('/');
    },[error]);
    useEffect(() => {
        console.log('data', data);
        if(data){
            setName(data.profileForUser.name);
            setBio(data.profileForUser.bio);
            setUsername(data.profileForUser.username);
            setIsMyProfile(data.profileForUser.isMyProfile);
            setNumberOfPosts(data.profileForUser.postCount);
            setNumberOfFollowers(data.profileForUser.followers);
            setNumberOfFollowing(data.profileForUser.following);
            setProfilePosts(data.profileForUser.posts);
            if(!data.profileForUser.isMyProfile)
                setIsFollowingThisProfile(data.profileForUser.isFollowingThisProfile)
        }
    }, [data]);
    if(loading || updatingMyProfile)
        return (<LoadingPage />)
    
    return (
        <Container>
            <TopBar navigate={navigate} apolloClient={apolloClient} />
            <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px', marginTop: '80px', position: 'relative' }}>
                <ProfileOptions 
                    setUpdateProfileModalOpen={setUpdateProfileModalOpen} 
                    isMyProfile={isMyProfile} 
                    followAUserQL={followAUserQL}
                    unfollowAUserQL={unfollowAUserQL}
                    username={username}
                    isFollowingThisProfile={isFollowingThisProfile}
                    refetchProfile={refetchProfile}
                    setTweetModalOpen={setTweetModalOpen}
                />
                <Avatar alt="Profile Picture" src="profile-picture-url" sx={{ width: 100, height: 100 }} >{name ? name.toUpperCase()[0] : 'T'}</Avatar>
                <Typography variant="h6">{name}</Typography>
                <Typography variant="subtitle1">@{username}</Typography>
                <Typography variant="body1">{bio}</Typography>
                
            </Paper>
            <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
                <Typography variant="body1">Tweets: {numberOfPosts}</Typography>
                <Typography variant="body1">Following: {numberOfFollowing}</Typography>
                <Typography variant="body1">Followers: {numberOfFollowers}</Typography>
            </Paper>
            
            <section>
                {TweetRenderer(profilePosts, username, isMyProfile, refetchProfile, disableButtons, setDisableButtons, deletePostQL, setUpdateTweet, setUpdateTweetModalOpen)}
            </section>
			{updateProfileModalOpen &&
			<UpdateProfileModal 
				updateProfileModalOpen={updateProfileModalOpen}
				setUpdateProfileModalOpen={setUpdateProfileModalOpen}
				name={name}
				bio={bio}
                updateMyProfileQL={updateMyProfileQL}
                updatingMyProfile={updatingMyProfile}
                errorUpdatingMyProfile={errorUpdatingMyProfile}
                refetchProfile={refetchProfile}
			/>}
            {tweetModalOpen &&
            <TweetModal
                setTweetModalOpen={setTweetModalOpen}
                makeAPostQL={makeAPostQL}
                makeAPostLoading={makeAPostLoading}
                makeAPostError={makeAPostError}
                refetchProfile={refetchProfile}
            />}
            {updateTweetModalOpen && 
            <UpdateTweetModal
                setUpdateTweetModalOpen={setUpdateTweetModalOpen}
                updateTweet={updateTweet}
                setUpdateTweet={setUpdateTweet}
                updateMyPostQL={updateMyPostQL}
                refetchProfile={refetchProfile}
            />}
        </Container>
    )
}

function ProfileOptions(props) {
    async function followRequestHandler(e){
        e.preventDefault();
        if(props.isFollowingThisProfile === null || props.isFollowingThisProfile === true)
            return;
        try {
            console.log('props.isFollowingThisProfile', props.isFollowingThisProfile)
                const response = await props.followAUserQL({
                    variables: {
                        celebrityUsername: props.username
                    },
                    context: {
                        headers: {
                            [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
                        }
                    }
                });
            console.log(response);
            props.refetchProfile();
        } catch (error) {
            console.log(error);
        }
    }
    async function unfollowRequestHandler(e){
        e.preventDefault();
        if(props.isFollowingThisProfile === null || props.isFollowingThisProfile === false)
            return;
        try {
            console.log('props.isFollowingThisProfile', props.isFollowingThisProfile)
                const response = await props.unfollowAUserQL({
                    variables: {
                        celebrityUsername: props.username
                    },
                    context: {
                        headers: {
                            [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
                        }
                    }
                });
            console.log(response);
            props.refetchProfile();
        } catch (error) {
            console.log(error);
        }
    }
    if(props.isMyProfile){
        return (
            <div style={{position: 'absolute', top: 20, right: 20, display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <Button variant="contained" onClick={()=>{props.setUpdateProfileModalOpen(true)}} style={{ fontWeight: 'bold' }}>
                    Update Profile
                </Button>
                <Button variant="contained" onClick={() => {props.setTweetModalOpen(true)}} style={{ fontWeight: 'bold' }}>
                    Tweet<Twitter style={{paddingLeft:'10px'}}></Twitter>
                </Button>
            </div>
        ) 
    } else {
        return (
            <Button  variant="contained" color={props.isFollowingThisProfile ? 'warning': 'primary'} onClick={async e => {
                try {
                    if(props.isFollowingThisProfile)
                        unfollowRequestHandler(e);
                    else
                        followRequestHandler(e)
                } catch (error) {
                    
                }
            }} style={{ position: 'absolute', top: 20, right: 20, fontWeight: 'bold' }}>
                {props.isFollowingThisProfile ? 'Unfollow' : 'Follow +' }
            </Button>
        )
    }
}

function UpdateProfileModal(props) {
	const [updatedName, setUpdatedName] = useState(props.name);
	const [updatedBio, setUpdatedBio] = useState(props.bio);
    const [disableButtons, setDisableButtons] = useState(false);

    async function updateMyProfile(e) {
        e.preventDefault();
        if(updatedName.trim().length === 0 || updatedBio.trim().length === 0)
            return;
        setDisableButtons(true);
        try {
            const response = await props.updateMyProfileQL({
                variables: { newName: updatedName, newBio: updatedBio },
                context: {
                    headers: {
                        [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
                    }
                }
            });
            console.log(response)
            props.refetchProfile()
        } catch (error) {
            console.log(error);
        } finally {
            setDisableButtons(false);
            props.setUpdateProfileModalOpen(false);
        }
    }

    return(
        <Modal
        open={true}
      >
        <div style={{backgroundColor:'white', padding: '40px', borderRadius:'5%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'white', boxShadow: 24, p: 4 }}>
			<Typography style={{paddingBottom: '10px'}} variant="h6" id="update-bio-modal-title">
				Update Profile
			</Typography>
			<TextField
				label='New Name'
				variant='outlined'
				fullWidth
				value={updatedName}
				onChange={e=>setUpdatedName(e.target.value)}
			/>
			<TextField
				label="New Bio"
				variant="outlined"
				fullWidth
				value={updatedBio}
				onChange={e=>setUpdatedBio(e.target.value)}
				multiline
				rows={4}
				margin="normal"
			/>
			<Container style={{display: 'flex', flexDirection: 'row', justifyContent:'space-evenly'}}>
                <Button disabled={disableButtons} onClick={async (e)=>{updateMyProfile(e)}} variant="contained" color="primary">
                    Save
                </Button>
                <Button disabled={disableButtons} onClick={async (e)=>{e.preventDefault();props.setUpdateProfileModalOpen(false)}} variant="contained" color="primary">
                    Cancel
                </Button>
            </Container>
			
        </div>
      </Modal>
    )
}

function TweetModal(props) {
    const [tweetContent, setTweetContent] = useState('');
    const [disableButtons, setDisableButtons] = useState(false);

    async function makeAPost(e) {
        e.preventDefault();
        if(tweetContent.trim().length === 0)
            return;
        setDisableButtons(true);
        try {
            const response = await props.makeAPostQL({
                variables: {
                    input: {
                        content: tweetContent
                    }
                },
                context: {
                    headers: {
                        [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
                    }
                }
            });
            console.log(response);
            props.refetchProfile()
        } catch (error) {
            console.log(error);
        } finally {
            setDisableButtons(false);
            props.setTweetModalOpen(false);
        }
    }

    return(
        <Modal
        open={true}
        aria-labelledby="update-bio-modal-title"
        aria-describedby="update-bio-modal-description"
      >
        <div style={{backgroundColor:'white', padding: '40px', borderRadius:'5%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'white', boxShadow: 24, p: 4 }}>
			<Typography variant="h6" id="update-bio-modal-title">
				Make A Tweet <Twitter></Twitter>
			</Typography>
			<TextField
				label="What is happening"
				variant="outlined"
				fullWidth
				value={tweetContent}
				onChange={e=>setTweetContent(e.target.value)}
				multiline
				rows={5}
				margin="normal"
			/>
			<Container style={{display: 'flex', flexDirection: 'row', justifyContent:'space-evenly'}}>
                <Button disabled={disableButtons} onClick={async (e)=>{makeAPost(e)}} variant="contained" color="primary">
                    Post!
                </Button>
                <Button disabled={disableButtons} onClick={async (e)=>{e.preventDefault();props.setTweetModalOpen(false)}} variant="contained" color="primary">
                    Cancel
                </Button>
            </Container>
			
        </div>
      </Modal>
    )
}

function UpdateTweetModal(props) {
    console.log('running update')
    
    const [newTweetContent, setNewTweetContent] = useState(props.updateTweet.content);
    const [postId, setPostId] = useState(props.updateTweet.id);
    const [disableButtons, setDisableButtons] = useState(false);
    
    async function makeAnUpdate(e) {
        e.preventDefault();
        if(newTweetContent.trim().length === 0)
            return;
        setDisableButtons(true);
        try {
            const response = await props.updateMyPostQL({
                variables: {
                    updatePostId: postId,
                    newContent: newTweetContent
                  },
                context: {
                    headers: {
                        [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
                    }
                }
            });
            console.log(response);
            await props.refetchProfile();
        } catch (error) {
            console.log(error);
        } finally {
            props.setUpdateTweetModalOpen(false);
            props.setUpdateTweet({});
            setDisableButtons(false);
        }
    }

    return(
        <Modal
        open={true}
      >
        <div style={{backgroundColor:'white', padding: '40px', borderRadius:'5%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'white', boxShadow: 24, p: 4 }}>
			<Typography variant="h6" id="update-bio-modal-title">
				Update A Tweet <Twitter></Twitter>
			</Typography>
			<TextField
				label="What new value"
				variant="outlined"
				fullWidth
				value={newTweetContent}
				onChange={e=>setNewTweetContent(e.target.value)}
				multiline
				rows={5}
				margin="normal"
			/>
			<Container style={{display: 'flex', flexDirection: 'row', justifyContent:'space-evenly'}}>
                <Button disabled={disableButtons} onClick={async (e)=>{makeAnUpdate(e)}} variant="contained" color="primary">
                    Save!
                </Button>
                <Button disabled={disableButtons} onClick={async (e)=>{e.preventDefault();props.setUpdateTweetModalOpen(false)}} variant="contained" color="primary">
                    Cancel
                </Button>
            </Container>
			
        </div>
      </Modal>
    )
}

function TweetRenderer(profilePosts, username, isMyProfile, refetchProfile, disableButtons, setDisableButtons, deletePostQL, setUpdateTweet, setUpdateTweetModalOpen){
    if(!profilePosts.length && profilePosts.length === 0 && isMyProfile){
        return (
            <Typography variant="body1" color="textSecondary">
                No tweets yet, Make some tweets
            </Typography>
        )
    }
    return(
        <>
            {profilePosts.map((posts, index) => {
                return <Tweet key={index} author={username} timestamp={posts.postedDate} content={posts.content} >
                        {isMyProfile && <Button disabled={disableButtons} variant='contained' color='warning' onClick={async e => {
                            if(!isMyProfile)
                                return false; 
                            console.log('deleting this post', posts.id);
                            e.preventDefault();
                            setDisableButtons(true)
                            try {
                                const verdict = await deletePostQL({
                                    variables: {
                                        deletePostId: posts.id
                                    },
                                    context: {
                                        headers: {
                                            [AUTHORIZATION]: sessionStorage.getItem(JWT_ACCESS_TOKEN_KEY)
                                        }
                                    }
                                })
                                console.log(verdict)
                                await refetchProfile();
                            } catch (error) {
                                console.log(error);
                            }finally{
                                setDisableButtons(false)
                            }
                        }}>Delete</Button>}
                        {isMyProfile && <Button disabled={disableButtons} variant='contained' color='warning' onClick={ async e => {
                            e.preventDefault();
                            setUpdateTweet({
                                id: posts.id,
                                content: posts.content
                            });
                            setUpdateTweetModalOpen(true);
                            
                        }}>Update</Button>}
                </Tweet>
            })}
        </>
    )
}