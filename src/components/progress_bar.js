import "./ProgressBar.css"

let ProgressBar = ({ percent }) => {
  
    return (
      <div style={{ display: "flex", justifyContent:"space-between" }}>
        <div className="progress-div" style={{ width: "100%" }}>
          <div style={{ width: `${percent*100}%` }} className="progress" />
        </div>
        <div style={{paddingLeft: "10px"}}>{percent.toFixed(2)}</div>
      </div>
    );
};

export default ProgressBar;