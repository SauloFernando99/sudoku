import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Sudoku.css'

const generateSudoku = () => {
  const board = Array.from({ length: 9 }, () => Array(9).fill(''));

  const isValid = (board, row, col, num) => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num || board[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + i % 3] === num) {
        return false;
      }
    }
    return true;
  };

  const fillBoard = (board) => {
    for (let i = 0; i < 81; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;

      if (board[row][col] === '') {
        const numbers = Array.from({ length: 9 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        for (let num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = '';
          }
        }
        return false;
      }
    }
    return true;
  };

  fillBoard(board);

  const removeNumbers = (board, count) => {
    const boardCopy = board.map(row => row.slice());
    for (let i = 0; i < count; i++) {
      let row = Math.floor(Math.random() * 9);
      let col = Math.floor(Math.random() * 9);
      while (boardCopy[row][col] === '') {
        row = Math.floor(Math.random() * 9);
        col = Math.floor(Math.random() * 9);
      }
      boardCopy[row][col] = '';
    }
    return boardCopy;
  };

  const completedBoard = board.map(row => row.slice());
  const boardWithHoles = removeNumbers(board, 65); //celulas para serem preenchidas

  return { boardWithHoles, completedBoard };
};

function Sudoku() {
  const [board, setBoard] = useState([]);
  const [fixedCells, setFixedCells] = useState([]);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const { boardWithHoles, completedBoard } = generateSudoku();
    const initialFixed = boardWithHoles.map(row => row.map(cell => cell !== ''));

    setBoard(boardWithHoles);
    setFixedCells(initialFixed);
  }, []);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (!token) {
          alert('Token not found. Please log in to play Sudoku.');
          window.location.href = '/login';
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/game/sudoku`, {
          headers: { 'x-access-token': token }
        });
        setMessage(response.data.message);
  
        const { boardWithHoles } = generateSudoku();
        const initialFixed = boardWithHoles.map(row => row.map(cell => cell !== ''));
        setBoard(boardWithHoles);
        setFixedCells(initialFixed);
      } catch (error) {
        alert('Token not found. Please log in to play Sudoku.');
        window.location.href = '/login';
        return;
      }
    };
  
    fetchGame();
  }, []);  

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      alert('Time is up! Game over.');
      window.location.reload();
    }
  }, [timeLeft]);

  const handleChange = (row, col, value) => {
    if (fixedCells[row][col]) return;
    if (/^[1-9]?$/.test(value)) {
      const newBoard = board.map((r, rowIndex) =>
        rowIndex === row
          ? r.map((cell, colIndex) => (colIndex === col ? value : cell))
          : r
      );
      setBoard(newBoard);
    }
  };

  const checkValid = () => {
    const isValid = (board) => {
      const rows = board;
      const cols = Array.from({ length: 9 }, (_, i) => board.map(row => row[i]));
      const grids = Array.from({ length: 9 }, (_, i) =>
        board.slice(i - (i % 3), i - (i % 3) + 3).flatMap(row => row.slice((i % 3) * 3, (i % 3) * 3 + 3))
      );

      const checkGroup = (group) => {
        const nums = group.filter(num => num !== '');
        return new Set(nums).size === nums.length;
      };

      return rows.every(checkGroup) && cols.every(checkGroup) && grids.every(checkGroup);
    };

    if (isValid(board)) {
      setMessage('Sudoku board is valid!');
    } else {
      setMessage('Sudoku board is invalid.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(300);
  };

  return (
    <div className='sudoku-container'>

      <h1>Sudoku Game</h1>
      <p>{message}!</p>
      {isLoggedIn && !gameStarted && <button onClick={startGame}>Start Game</button>}
      {isLoggedIn && (
        <>
          {gameStarted && (
            <>
              <p className="timer">Time left: {formatTime(timeLeft)}</p>
              <div className="sudoku-board">
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="sudoku-row">
                    {row.map((cell, colIndex) => (
                      <input
                        key={colIndex}
                        type="text"
                        value={cell}
                        onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                        className={`sudoku-cell ${fixedCells[rowIndex][colIndex] ? 'fixed-cell' : ''}`}
                        maxLength="1"
                        readOnly={fixedCells[rowIndex][colIndex]}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <button onClick={checkValid}>Check</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Sudoku;
