import "./ProgressBar.css"

let ProgressBar = ({ backgroundColor, percent }) => {

    if (typeof backgroundColor === 'undefined'){
      backgroundColor = "#000000"
    }
  
    return (
      <div style={{ display: "flex", justifyContent:"space-between" }}>
        <div className="progress-div" style={{ width: "100%" }}>
          <div style={{ width: `${percent*100}%`, backgroundColor: `${backgroundColor}` }} className="progress" />
        </div>
        <div style={{paddingLeft: "10px"}}>{percent.toFixed(2)}</div>
      </div>
    );
};

export default ProgressBar;