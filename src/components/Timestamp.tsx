import React from "react";
import styles from "./Timestamp.module.css";

interface Props {
  time: number | null;
}

interface States {
}

export class Timestamp extends React.Component<Props, States> {
  render() {
    return (
      <div className={styles.timer}>
        {this.props.time !== null
          ? this.formatTimeString(this.props.time)
          : "??:??:??"}
      </div>
    );
  }

  private formatTimeString(miliSeconds: number): string {
    const hours = this.getHours(miliSeconds);
    const minutes = this.getMinutes(miliSeconds);
    const seconds = this.getSeconds(miliSeconds);
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  private getHours(miliSeconds: number): number {
    return Math.floor(miliSeconds / 1000 / 60 / 60) % 24;
  }

  private getMinutes(miliSeconds: number): number {
    return Math.floor(miliSeconds / 1000 / 60) % 60;
  }

  private getSeconds(miliSeconds: number): number {
    return Math.floor(miliSeconds / 1000) % 60;
  }
}
