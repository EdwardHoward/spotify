import * as React from 'react';

export interface TimerProps {
   currentTime: number;
   counting: boolean;
   renderType: 'seconds' | 'minutes';
   onFinished: () => void;
   onTick: () => void;
}

export interface TimerState {
   currentTime: number; // in seconds
}

export default class Timer extends React.PureComponent<TimerProps, any> {
   interval;

   constructor(props) {
      super(props);
   }

   componentDidMount() {
      if (this.props.counting) {
         this.start();
      }
   }

   componentDidUpdate(prevProps) {
      if (this.props.counting !== prevProps.counting) {
         if (this.props.counting) {
            this.start();
         } else {
            clearInterval(this.interval);
         }
      }
   }

   componentWillUnmount(){
      clearInterval(this.interval);
   }

   private start() {
      this.interval = setInterval(this.tick, 1000);
   }

   private tick = () => {
      if (this.props.currentTime - 1 == 0) {
         //clearInterval(this.interval);
         //this.props.onFinished();
      }

      this.props.onTick();
   }

   private renderTime() {

      if (this.props.renderType === 'minutes') {
         const minutes = Math.floor(this.props.currentTime / 60);
         const seconds = ('0' + this.props.currentTime % 60).substr(-2, 2);

         return `${minutes}:${seconds}`;
      }

      if (this.props.renderType === 'seconds') {
         const seconds = ('0' + this.props.currentTime).substr(-2, 2);

         return `${seconds}`;
      }
   }



   public render() {
      return (
         <span className="p-1 time">
            {this.renderTime()}
         </span>
      );
   }
}