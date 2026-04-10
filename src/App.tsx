import React from "react";
import { GameService } from "./services/GameService";
import { UserService } from "./services/UserService";
import { MockGameService } from "./services/MockGameService";
import { MockUserService } from "./services/MockUserService";
import styles from "./App.module.css";

export default class App extends React.Component<{}, {}> {
  private readonly gameService: GameService = new MockGameService();
  private readonly userService: UserService = new MockUserService();

  render() {
    return (
      <div className={styles.container}></div>
    );
  }
}
