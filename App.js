// App.js
import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Text } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

// Define sizes for our game objects
const BOX_SIZE = 50;
const PLATFORM_WIDTH = 200;
const PLATFORM_HEIGHT = 20;

// Render component for the character (red box)
class Box extends Component {
  render() {
    const { body } = this.props;
    const x = body.position.x - BOX_SIZE / 2;
    const y = body.position.y - BOX_SIZE / 2;
    return (
      <View style={[styles.box, { left: x, top: y }]} />
    );
  }
}

// Render component for the platform (blue bar)
class Platform extends Component {
  render() {
    const { body } = this.props;
    const x = body.position.x - PLATFORM_WIDTH / 2;
    const y = body.position.y - PLATFORM_HEIGHT / 2;
    return (
      <View style={[styles.platform, { left: x, top: y }]} />
    );
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.gameEngine = null;

    // Create the Matter.js engine and world
    const engine = Matter.Engine.create({ enableSleeping: false });
    const world = engine.world;
    // Adjust gravity if needed (default y gravity is 1)
    world.gravity.y = 2;

    // Create a dynamic body for the character (the red box)
    const box = Matter.Bodies.rectangle(WIDTH / 4, HEIGHT / 4, BOX_SIZE, BOX_SIZE, {
      restitution: 2, // no bounce
    });
    // Give the box an initial horizontal velocity
    Matter.Body.setVelocity(box, { x: 2, y: 0 });

    // Create a static platform for the player to control (the blue bar)
    const platform = Matter.Bodies.rectangle(WIDTH / 2, HEIGHT - 100, PLATFORM_WIDTH, PLATFORM_HEIGHT, {
      isStatic: true,
    });

    // Add the bodies to the world
    Matter.World.add(world, [box, platform]);

    // Set up the entities that the GameEngine will manage
    this.entities = {
      physics: { engine: engine, world: world },
      box: { body: box, renderer: Box },
      platform: { body: platform, renderer: Platform },
    };

    this.state = {
      running: true,
    };
  }

  // Physics system that updates the Matter.js engine each frame
  physics = (entities, { time }) => {
    let engine = entities.physics.engine;
    Matter.Engine.update(engine, time.delta);

    // If the box falls off the bottom, reset its position and velocity.
    const box = entities.box.body;
    if (box.position.y - BOX_SIZE / 2 > HEIGHT) {
      Matter.Body.setPosition(box, { x: WIDTH / 4, y: HEIGHT / 4 });
      Matter.Body.setVelocity(box, { x: 2, y: 0 });
    }

    return entities;
  };

  // Function to move the platform left or right.
  movePlatform = (direction) => {
    const platform = this.entities.platform.body;
    // Translate the platform horizontally by 10 pixels.
    Matter.Body.translate(platform, { x: direction * 10, y: 0 });
  };

  render() {
    return (
      <View style={styles.container}>
        <GameEngine
          ref={(ref) => { this.gameEngine = ref; }}
          style={styles.gameContainer}
          systems={[this.physics]}
          entities={this.entities}
          running={this.state.running}
        >
        </GameEngine>
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => this.movePlatform(-1)} style={styles.button}>
            <Text>Left</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.movePlatform(1)} style={styles.button}>
            <Text>Right</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#eee',
  },
  box: {
    position: 'absolute',
    backgroundColor: 'red',
    width: BOX_SIZE,
    height: BOX_SIZE,
  },
  platform: {
    position: 'absolute',
    backgroundColor: 'blue',
    width: PLATFORM_WIDTH,
    height: PLATFORM_HEIGHT,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    margin: 10,
    padding: 10,
    backgroundColor: '#ddd',
  },
});
