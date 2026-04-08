export class IntervalHandler {
    private intervalId: number | null = null;
    private readonly timeout: number;
    private readonly callback: () => void | Promise<void>;

    constructor(callback: () => void | Promise<void>, timeout: number) {
        this.timeout = timeout;
        this.callback = callback;
    }

    start = () => {
        this.clear();
        this.intervalId = window.setInterval(this.tick, this.timeout);
    }

    private tick = async () => {
        try {
            await this.callback();
        } catch (error) {
            console.error('IntervalHandler callback failed:', error);
        }
    }

    clear() {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
