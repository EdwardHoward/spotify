import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Timer from '../Timer';

export interface ISpotifyProps {
}

export function Spotify(props: ISpotifyProps) {
   const [authorized, setAuthorized] = useState(false);
   const [authenticateLink, setAuthenticateLink] = useState('');
   const [playing, setPlaying] = useState(true);
   const [currentTime, setCurrentTime] = useState(60);

   const url = 'http://192.168.1.177:3030';
   useEffect(() => {
      axios.get(`${url}/login`, { withCredentials: true }).then((data) => {
         console.log(data);
         if (data.data.authenticated) {
            setPlaying(data.data.playing.body.is_playing);
            setAuthorized(true);
         } else {
            setAuthenticateLink(data.data);

            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has("code")) {
               // pass the code into the backend to authenticate
               axios.get(`${url}/code?code=` + urlParams.get("code"), { withCredentials: true }).then(data => {
                  if (data.data === true) {
                     setAuthorized(true);
                  }
               });
            }
         }
      });
   }, []);

   function play() {
      axios.get(`${url}/play`, { withCredentials: true }).then((data) => {
         setPlaying(true);
      });
   }

   function pause(){
      axios.get(`${url}/pause`, { withCredentials: true }).then((data) => {
         setPlaying(false);
      })
   }

   function next() {
      return axios.get(`${url}/next`, { withCredentials: true });
   }

   function prev() {
      axios.get(`${url}/prev`, { withCredentials: true });
   }

   function Player(props) {
      return (
         <div>
            <button onClick={prev}>Prev</button>
            {props.playing ? <button onClick={pause}>Pause</button> : <button onClick={play}>Play</button>}
            <button onClick={next}>Next</button>
         </div>
      )
   }

   function Authorize(props){
      return (
         <a href={props.link}>Authorize</a>
      )
   }

   function onTick(){
      setCurrentTime(currentTime - 1);
   }

   function onFinished(){
      next().then((data) => {
         console.log(data);
         setCurrentTime(60);
      });
   }

   return (
      <div>
         {/* {authorized ? <div><Timer currentTime={currentTime} onTick={onTick} counting={playing} onFinished={onFinished} /></div> : null} */}
         {authorized ? <Player playing={playing}/> : <Authorize link={authenticateLink} />}
      </div>
   );
}
