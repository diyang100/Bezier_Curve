import './App.css';
import BezierController from './components/bezier_controller';

function App() {
  return (
    <div className="App">
      <div className="module-wrapper">
        <div className="grid-container">
          <div className="grid-item">
            <BezierController id="initial" initialType="cubic" />
          </div>
          <div className="grid-item">
            <BezierController id="initial" initialType="quadratic" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
