import { Link } from "react-router-dom";
function Inicio (){
    return (
    <>
    <h1>Blackjack</h1>
    <h4>por ari</h4>
    <Link to={"/juego"}>
        <button> Jugar</button>
    </Link>

    </>
    )
}

export default Inicio;