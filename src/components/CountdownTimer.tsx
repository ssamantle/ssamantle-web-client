import React from "react";
import styles from "./CountdownTimer.module.css";

interface Props {
    targetTime: number;
    label?: string;
    completedMessage?: string;
}

interface State {
    currentTime: number;
}

export class CountdownTimer extends React.Component<Props, State> {
    private intervalId: number | null = null;

    constructor(props: Props) {
        super(props);
        this.state = { currentTime: Date.now() };
    }

    componentDidMount() {
        this.tick();
        this.syncInterval();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.targetTime !== this.props.targetTime) {
            this.setState({ currentTime: Date.now() }, () => {
                this.syncInterval();
            });
            return;
        }
        this.syncInterval();
    }

    componentWillUnmount() {
        this.clearInterval();
    }

    private isCompleted() {
        return this.state.currentTime >= this.props.targetTime;
    }

    private tick = () => {
        this.setState({ currentTime: Date.now() });
    };

    private clearInterval() {
        if (this.intervalId === null) return;

        window.clearInterval(this.intervalId);
        this.intervalId = null;
    }

    private syncInterval() {
        if (this.isCompleted()) {
            this.clearInterval();
            return;
        }

        if (this.intervalId === null) {
            this.intervalId = window.setInterval(this.tick, 1000);
        }
    }

    render() {
        const { label, completedMessage, targetTime } = this.props;
        const { currentTime } = this.state;
        const isCompleted = this.isCompleted();
        const valueText = (isCompleted && completedMessage)
                ? completedMessage
                : formatTimeString(targetTime - currentTime);

        return (
            <div className={styles.timer}>
                {label ? (<span className={styles.label}>{label}</span>) : null}
                <strong className={styles.value}>{valueText}</strong>
            </div>
        );
    }
}

function formatTimeString(ms: number) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
