import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [mazo, setMazo] = useState();
  const [mazoJugador, setMazoJugador] = useState([]);
  const [mazoCroupier, setMazoCroupier] = useState([]);
  const [totalJ, setTotalJ] = useState(0);
  const [totalC, setTotalC] = useState(0);
  const [ganador, setGanador] = useState();
  const [turnoCroupier, setTurnoCroupier] = useState(false);

  
  const conseguirMazo = () => {
   return fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
      .then((res) => res.json())
      .then((data) => {
        setMazo(data);
        return data;
      });
  };

  const valorCarta = (carta) => {
    if (["KING", "QUEEN", "JACK"].includes(carta.value)) return 10;
    if (carta.value === "ACE") return carta.chosenValue ?? 0;
    return parseInt(carta.value);
  };

  //Lógica valor de los Ases para el croupier (ayuda)
  const valorCartaCroupier = (carta) => {
    if (["KING", "QUEEN", "JACK"].includes(carta.value)) return 10;
    if (carta.value === "ACE") return 11;
    return parseInt(carta.value);
  };


  const calcularTotalCroupier = (cartas) => {
    let total = cartas.reduce((a, c) => a + valorCartaCroupier(c), 0);
    let ases = cartas.filter((c) => c.value === "ACE").length;
    while (total > 21 && ases > 0) {   //no lo hice yo, pero determina el valor de las AS en función de lo que le conviene al croupier:/
      total -= 10;
      ases--;
    }
    return total;
  };

  const agarrarCarta = (deckId, cantidad = 1, destino = "jugador") => {

    if (!deckId) return;
    return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${cantidad}`)
      .then((res) => res.json())
      .then((data) => {
        if (destino === "jugador") {
          const nuevas = data.cards.map((c) => ({ ...c }));
          setMazoJugador((prev) => [...prev, ...nuevas]);
        } else if (destino === "croupier") {
          setMazoCroupier((prev) => [...prev, ...data.cards]);
        }
      });
  };

  const elegirValorAs = (code, valor) => {
    setMazoJugador((prev) =>
      prev.map((carta) =>
        carta.code === code ? { ...carta, chosenValue: valor } : carta
      )
    );
  };

  //calcula total del jugador
  useEffect(() => {
    const total = mazoJugador.reduce((acum, carta) => acum + valorCarta(carta), 0);
    setTotalJ(total);

    if (total === 21) { //si el jugador llega a 21, gana
      setGanador("Jugador");
      setTurnoCroupier(false);
    } else if (total > 21) {
      setGanador("Croupier");
    }
  }, [mazoJugador]);

  //calcula total del croupier
  useEffect(() => {
    const total = calcularTotalCroupier(mazoCroupier);
    setTotalC(total);

    if (turnoCroupier && mazo?.deck_id && total < 17 && !ganador) {

      agarrarCarta(mazo.deck_id, 1, "croupier").then(() => {
        const nuevoTotal = calcularTotalCroupier([...mazoCroupier]);
        setTotalC(nuevoTotal);
        if (nuevoTotal >= 17) {
          if (nuevoTotal > 21 || totalJ > nuevoTotal) setGanador("Jugador");
          else setGanador("Croupier");
        } else {
          setTurnoCroupier(true);
        }
      });
    } else if (turnoCroupier && total >= 17 && !ganador) {
      if (total > 21 || totalJ > total) setGanador("Jugador");
      else setGanador("Croupier");
    }
  }, [mazoCroupier, turnoCroupier]);


  useEffect(() => {
    conseguirMazo().then((nuevoMazo) => {   //arranca, crea el mazo y reparte 2 cartas a cada uno
      agarrarCarta(nuevoMazo.deck_id, 2, "jugador");
      agarrarCarta(nuevoMazo.deck_id, 2, "croupier");
    });
  }, []);

  const finalizarTurnoJugador = () => {
    if (!ganador) setTurnoCroupier(true); //el turno del cupier anda mientras no haya ganado ninguno
  };

  return (
    <div className="contenedor-juego">
      <h1 className="titulo">Blackjack</h1>
      {!ganador && (
        <div className="zona-botones">
          <button onClick={() => agarrarCarta(mazo?.deck_id, 1, "jugador")}>
            Agarrar carta
          </button>
          <button onClick={finalizarTurnoJugador}>Plantarse</button>
        </div>
      )}
     <h2 className="subtitulo">Jugador</h2>

      <div className="zona-cartas">
        {mazoJugador.map((carta) => (
          <div key={carta.code} className="carta">
            <img src={carta.image} alt={carta.code} className="imagen-carta" />
            {carta.value === "ACE" && carta.chosenValue == null && (
            <div className="opciones-as">
            <button onClick={() => elegirValorAs(carta.code, 1)}>Vale 1</button>
            <button onClick={() => elegirValorAs(carta.code, 11)}>Vale 11</button>
            </div>
            )}
            {carta.value === "ACE" && carta.chosenValue != null && (
              <p>As vale: {carta.chosenValue}</p> )}
          </div>
        ))}
      </div>
      <p className="total">Total: {totalJ}</p>

      <h2 className="subtitulo">Croupier</h2>
      <div className="zona-cartas">
        {mazoCroupier.map((carta) => (
        <img key={carta.code} src={carta.image} alt={carta.code} className="imagen-carta"/>
        ))}
      </div>
      <p className="total">Total: {totalC}</p>

      {ganador && <h2 className="ganador">Ganador: {ganador}</h2>}
    </div>
  );
}

export default App;
