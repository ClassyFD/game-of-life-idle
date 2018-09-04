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
      lifePoints: 5000000,
      deathPoints: 5000000,
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
          costMultiplier: 10.00,
          amountMultiplier: 1.00,
        },
        {
          name: 'Increase life multiplier',
          baseCost: {
            lifePoints: 0,
            deathPoints: 5,
          },
          baseAmount:.1,
          levels: 100,
          currentLevel: 0,
          costMultiplier: 1.15,
          amountMultiplier: 1.15,
        },
        {
          name: 'Decrease death multiplier',
          baseCost: {
            lifePoints: 10,
            deathPoints: 0,
          },
          baseAmount:.08,
          levels: 10,
          currentLevel: 0,
          costMultiplier: 3.7,
          amountMultiplier: 1.00,
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
          costMultiplier: 1.15,
          amountMultiplier: 1.15,
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
          costMultiplier: 1.15,
          amountMultiplier: 1.50,
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
    this.state.gameObj.forEach((el)=>{
      if (el.x === x && el.y === y && el.type === 'powered') {
        TweenMax.to(`.game-square_${x}-${y}`, 0, {backgroundColor: '#e4e4e4'})
        el.status = 'dead';
        el.type = 'regular';
        this.setState({
          power: state.power + 1,
          numAlive: state.numAlive - 1,
          lifePoints: Number((state.lifePoints - (state.lifeBonus * state.deathMultiplier)).toFixed(2)),
          deathPoints: Number((state.deathPoints + state.deathBonus).toFixed(2)),
        })
        setTimeout(() => {
          this.gameClock();
        }, 10);
      } else if (state.power > 0 && el.x === x && el.y === y) {
        TweenMax.to(`.game-square_${x}-${y}`, 0, {backgroundColor: '#FFFF66'})
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

  buyUpgrade(type, currentLevel, levels, baseCost, costMultiplier, baseAmount, amountMultiplier) {
    let lifePointCost = Number((baseCost.lifePoints * Math.pow(costMultiplier, currentLevel)).toFixed(2)),
        deathPointCost = Number((baseCost.deathPoints * Math.pow(costMultiplier, currentLevel)).toFixed(2)),
        lifePointSubtracted = Number((this.state.lifePoints - lifePointCost).toFixed(2)),
        deathPointSubtracted = Number((this.state.deathPoints - deathPointCost).toFixed(2)),
        multiplier = Number((baseAmount * Math.pow(amountMultiplier, currentLevel)).toFixed(2));

    if (this.state.lifePoints >= lifePointCost && this.state.deathPoints >= deathPointCost && currentLevel < levels) {
      this.state.upgrades.forEach((el)=>{
        if (el.name === type) {
          el.currentLevel += 1;
          this.setState({
            lifePoints: lifePointSubtracted,
            deathPoints: deathPointSubtracted,
          })
          switch (type) {
            case 'Decrease death multiplier':
              this.setState({
                deathMultiplier: Number((this.state.deathMultiplier - multiplier).toFixed(2))
              });
              break;
            case 'Increase life multiplier':
              this.setState({
                lifeMultiplier: Number((this.state.lifeMultiplier + multiplier).toFixed(2))
              });
              break;
            case 'Increase death bonus':
              this.setState({
                deathBonus: Number((this.state.deathBonus + multiplier).toFixed(2))
              })
              break;
            case 'Increase life bonus':
              this.setState({
                lifeBonus: Number((this.state.lifeBonus + multiplier).toFixed(2))
              })
              break;
            case 'Increase power':
              this.setState({
                power: Number((this.state.power + multiplier).toFixed(2))
              })
              break;
            default:
              break;
            }
          setTimeout(()=>{
            this.gameClock();
          }, 50)
          iziToast.show({
            message: 'Upgrade bought',
            position: 'bottomRight',
            timeout: 1000,
          })
        }
      })
    } else if (currentLevel === levels) {
      iziToast.error({
        message: 'Max upgrades bought',
        position: 'bottomLeft',
        timeout: 1000,
      })
    } else if (this.state.lifePoints < lifePointCost && this.state.deathPoints < deathPointCost) {
      iziToast.error({
        message: 'Not enough life or death points',
        position: 'bottomLeft',
        timeout: 1000,
      })
    } else if (this.state.lifePoints < lifePointCost) {
      iziToast.error({
        message: 'Not enough life points',
        position: 'bottomLeft',
        timeout: 1000,
      })
    } else if (this.state.deathPoints < deathPointCost) {
      iziToast.error({
        message: 'Not enough death points',
        position: 'bottomLeft',
        timeout: 1000,
      })
    }
  }

  render() {
    let { state } = this,
    upgrades = this.state.upgrades.map((el, i)=>{
      let lifePointCost = Number((el.baseCost.lifePoints * Math.pow(el.costMultiplier, el.currentLevel)).toFixed(2)),
          deathPointCost = Number((el.baseCost.deathPoints * Math.pow(el.costMultiplier, el.currentLevel)).toFixed(2));
        return (
          <aside key={i} onClick={()=>{this.buyUpgrade(el.name, el.currentLevel, el.levels, el.baseCost, el.costMultiplier, el.baseAmount, el.amountMultiplier)}} className={`game-upgrades`}>
            <h1>
              {el.name}
            </h1>
            <p>
            {el.currentLevel} / {el.levels}
            </p>
            <div>
              {el.currentLevel === el.levels? (
                <div>
                  <h2>
                    Max level
                  </h2>
                </div>
              ) : (
                <div>
                  <h2>
                    Cost:
                  </h2>
                  <div>
                    <p>{lifePointCost? `${lifePointCost} Life points` : null}</p>
                    <p>{deathPointCost? `${deathPointCost} Death points` : null}</p>
                  </div>  
                </div>
              )}
            </div>
          </aside>
        )
      }
    )
  
    return (
      <main className={'Game'}>
        <section className={`game-score-section`}>
          <h1>
            Power: {state.power}
          </h1>
          <h1>
            Life points: {state.lifePoints}
          </h1>
          <h1>
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
          {upgrades}
        </section>
      </main>
    )
  }
}
export default Game;