import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Timer from '../Timer';
import { Segment, Container, Header, Icon, Button } from 'semantic-ui-react';
import * as ReactCountdownClock from 'react-countdown-clock';

export interface ISpotifyProps {
}

const countdownTime = 10;

export function Spotify(props: ISpotifyProps) {
   const [authorized, setAuthorized] = useState(false);
   const [authenticateLink, setAuthenticateLink] = useState('');
   const [playing, setPlaying] = useState(true);
   const [currentTime, setCurrentTime] = useState(countdownTime);
   const [showControl, setShowControl] = useState<boolean>(false);

   const url = 'http://192.168.1.177:3030';
   useEffect(() => {
      axios.get(`${url}/login`, { withCredentials: true }).then((data) => {
         console.log(data);
         if (data.data.authenticated) {
            if(data.data.playing.body && data.data.playing.body.is_playing)
               setPlaying(true);
            else{
               setPlaying(false);
            }
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

    useEffect(() => {
      if(currentTime == 0){
         next()
      }

      if(currentTime == -1){
         setCurrentTime(countdownTime);
      }
    }, [currentTime]);

   function play() {
      axios.get(`${url}/play`, { withCredentials: true }).then((data) => {
         setPlaying(true);
      });
   }

   function pause() {
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
      // return (
      //    <div>
      //       <button onClick={prev}>Prev</button>
      //       {props.playing ? <button onClick={pause}>Pause</button> : <button onClick={play}>Play</button>}
      //       <button onClick={next}>Next</button>
      //    </div>
      // )

      return (
         <div className={"hover-opacity" + (props.playing ? ' hidden' : '')}>
            {(props.playing ?
               <Playing /> :
               <Paused />)}
         </div>
      )
   }

   function Authorize(props) {
      return (
         <a href={props.link}>Authorize</a>
      )
   }

   async function onTick() {
      setCurrentTime(currentTime - 1);
   }

   function onFinished() {
      
   }

   function Playing(props) {
      return (
         <>
            <Icon name='pause circle' size="massive" className="icon-button" onClick={pause} />
         </>
      )
   }

   function Paused(props) {
      return (
         <>
            <Icon name='play circle' size="massive" className="icon-button" onClick={play} />
         </>
      )
   }

   return (
      <Container className="p-2 center">
         {/* {authorized ? <div><Timer currentTime={currentTime} onTick={onTick} counting={playing} onFinished={onFinished} /></div> : null} */}
         {/* {authorized ? <Player playing={playing}/> : <Authorize link={authenticateLink} />} */}


         {authorized &&
            <div className="d-flex">
               {/* <ReactCountdownClock paused={!playing} seconds={60} color="#000" size={300} onComplete={onFinished} /> */}
               <Timer renderType="seconds" currentTime={currentTime} onTick={onTick} counting={playing} onFinished={onFinished} />
            </div>
         }
         {authorized ? <Player showControl={!playing} playing={playing} /> : <Authorize link={authenticateLink} />}
         {/* </Segment> */}
      </Container>
   );
}
