import React from 'react';
import {Link} from 'react-router-dom';
import './Home.css'; // Zaimportuj plik CSS

function Home(button) {
    return (
        <div className="center-content">
            <h1>Witaj!</h1>
            <table>
                <tbody>
                <tr>
                    <td><Link to="/Books">
                        <button className="home-button">Przejdź do listy książek</button>
                    </Link>
                        <Link to="/CheckOuts">
                            <button className="home-button">Przejdź do listy wypożyczeń</button>
                        </Link></td>
                </tr>
                </tbody>
            </table>
        </div>
    )
        ;
}

export default Home;