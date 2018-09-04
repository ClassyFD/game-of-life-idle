import React, { Component } from 'react';
import { TweenMax } from 'gsap';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.css';
import './Game.css'

class Game extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gameObj: [],
      power: 1,
      numAlive: 0,
      lifePoints: 0,
      deathPoints: 0,
      lifeBonus: 1.0,
      deathBonus: 0.1,
      lifeMultiplier: 0.1,
      deathMultiplier: 0.8,
      intervalValue: 1000,
      upgradeUnlock: '50%',
      upgrades: [
        {
          name: 'Increase power',
          baseCost: {
            lifePoints: 50,
            deathPoints: 25,
          },
          baseAmount: 1, 
          levels: 10,
          currentLevel: 0,
        },
        {
          name: 'Increase life multiplier',
          baseCost: {
            lifePoints: 0,
            deathPoints: 10,
          },
          baseAmount:.1,
          levels: 100,
          currentLevel: 0,
        },
        {
          name: 'Decrease death multiplier',
          baseCost: {
            lifePoints: 10,
            deathPoints: 0,
          },
          baseAmount:.05,
          levels: 100,
          currentLevel: 0,
        },
        {
          name: 'Increase death bonus',
          baseCost: {
            lifePoints: 50,
            deathPoints: 0,
          },
          baseAmount:.1,
          levels: 100,
          currentLevel: 0,
        },
        {
          name: 'Increase life bonus',
          baseCost: {
            lifePoints: 0,
            deathPoints: 50,
          },
          baseAmount:.1,
          levels: 100,
          currentLevel: 0,
        },
      ]
    }
  }
  componentWillMount() {
    let gameObj = [],
        key = 1;
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 5; j++) {
        gameObj.push(
          {
            key,
            x: i,
            y: j,
            status: 'dead',
            type: 'regular',
          }
        )
        key++;
      }
    }
    this.setState({
      gameObj
    })
  }

  componentDidMount() {
    this.gameClock();
  }

  gameClock() {
    let { state } = this,
        total;
    clearInterval(this.state.gameClock);
    this.setState({
      gameClock: setInterval(()=>{
        total = this.state.lifePoints + Number((state.numAlive * state.lifeMultiplier).toFixed(2))
        this.setState({
          lifePoints: Number(total.toFixed(2))
        }) 
      }, state.intervalValue)
    })
  }

  activateSquare(x, y) {
    let { state } = this;
    this.state.gameObj.map((el, i)=>{
      if (el.x === x && el.y === y && el.type === 'powered') {
        TweenMax.to(`.game-square_${x}-${y}`, 0, {backgroundColor: '#e4e4e4'})
        el.status = 'dead';
        el.type = 'regular';
        this.setState({
          power: state.power + 1,
          numAlive: state.numAlive - 1,
          lifePoints: Number((state.lifePoints - state.deathMultiplier).toFixed(2)),
          deathPoints: Number((state.deathPoints + state.deathBonus).toFixed(2)),
        })
        setTimeout(() => {
          this.gameClock();
        }, 10);
      } else if (state.power > 0 && el.x === x && el.y === y) {
        TweenMax.to(`.game-square_${x}-${y}`, 0, {backgroundColor: '#1fbed6'})
        el.status = 'alive';
        el.type = 'powered';
        this.setState({
          power: state.power - 1,
          numAlive: state.numAlive + 1,
          lifePoints: Number((state.lifePoints + state.lifeBonus).toFixed(2)),
        })
        setTimeout(() => {
          this.gameClock();
        }, 10);
      } else if (el.x === x && el.y === y) {
        iziToast.error({
          message:'Not enough power!',
          position:'bottomLeft',
          timeout: 1000,
        });
      }
    })
  }
  render() {
    let { state } = this;
    return (
      <main className={'Game'}>
        <section className={`game-score-section`}>
          <h1 className={`game-score-heading`}>
            Power: {state.power}
          </h1>
          <h1 className={`game-score-heading`}>
            Life points: {state.lifePoints}
          </h1>
          <h1 className={`game-score-heading`}>
            Death points: {state.deathPoints}
          </h1>
        </section>
        <section className={`game-main-section`}>
          {state.gameObj.map((el)=>{
            return (
              <div onClick={()=>{this.activateSquare(el.x, el.y)}} key={el.key} className={`game-square_${el.x}-${el.y} game-square`}/>
            )
          })}
        </section>
        <section className={`game-upgrades-section`}>
          {this.state.upgrades.map((el)=>{
            return (
              <aside className={`game-upgrades`}>
                <h1>
                  {el.name}
                </h1>
                <p>
                 Bought: {el.currentLevel} / {el.levels}
                </p>
                <div>
                  <h2>
                    Cost:
                  </h2>
                    {el.baseCost.lifePoints? <p>{el.baseCost.lifePoints} Life points</p>: null}
                    {el.baseCost.deathPoints? <p>{el.baseCost.deathPoints} Death points</p> : null}
                </div>
              </aside>
            )
          })}
        </section>
      </main>
    )
  }
}
export default Game;