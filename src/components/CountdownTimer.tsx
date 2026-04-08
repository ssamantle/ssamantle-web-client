import React from "react";
import styles from "./CountdownTimer.module.css";
import { IntervalHandler } from "../utils/IntervalHandler";

interface Props {
  targetTime: number;
  completedMessage?: string;
}

interface State {
  currentTime: number;
}

export class CountdownTimer extends React.Component<Props, State> {
  private readonly intervalHandler: IntervalHandler;

  state: State = {
    currentTime: Date.now(),
  };

  constructor(props: Props) {
    super(props);
    this.intervalHandler = new IntervalHandler(this.tick, 1000);
  }

  componentDidMount() {
    this.intervalHandler.start();
  }

  componentWillUnmount() {
    this.intervalHandler.clear();
  }

  private isCompleted() {
    return this.state.currentTime >= this.props.targetTime;
  }

  private tick = () => {
    if (this.isCompleted()) {
      this.intervalHandler.clear();
      return;
    }

    const now = Date.now();
    this.setState({ currentTime: now });
  };

  private formatTimeString(ms: number) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  render() {
    const { completedMessage, targetTime } = this.props;
    const { currentTime } = this.state;

    return (
      <div className={styles.timer}>
        {this.isCompleted() && completedMessage
          ? completedMessage
          : this.formatTimeString(targetTime - currentTime)}
      </div>
    );
  }
}
