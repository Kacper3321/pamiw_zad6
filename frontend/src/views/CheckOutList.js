    import React, {Component} from 'react';
    import axios from '../config/axios-config';
    import {format} from "date-fns";
    import './CheckOutList.css';
    import {Link} from "react-router-dom";

    class CheckOutList extends Component {
        constructor() {
            super();
            this.state = {
                checkOuts: [],
                sortedCheckOuts: [],
                books: [],
                selecteBookId: '',
                editingId: null,
                isEditing: null,
                currentPage: 1,
                itemsPerPage: 5,
                newCheckOut: {
                    checkoutDate: '',
                    returnDays: '',
                    borrowerFullName: '',
                    bookTitle: '', // Dodaj pole bookTitle
                    editedReturnDays: '', // Dodaj pole editedReturnDays
                    editedBorrowerFullName: '', // Dodaj pole editedBorrowerFullName
                },
                isFormVisible: false,
            };
        }

        getCurrentCheckOuts() {
            const { currentPage, itemsPerPage, sortedCheckOuts } = this.state;
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            return sortedCheckOuts.slice(indexOfFirstItem, indexOfLastItem);
        }

        componentDidMount() {
            // Pobierz listę wypożyczeń z backendu po załadowaniu komponentu
            this.fetchCheckOuts();

            axios
                .get('/books')
                .then((response) => {
                    this.setState({ books: response.data });
                })
                .catch((error) => {
                    console.error('Błąd podczas pobierania danych:', error);
                });
        }

        fetchCheckOuts() {
            axios
                .get('/checkouts')
                .then((response) => {
                    console.log('Odpowiedź z serwera:', response.data);
                    const sortedCheckOuts = [...response.data].sort((a, b) => a.id - b.id);
                    this.setState({ checkOuts: response.data, sortedCheckOuts });
                })
                .catch((error) => {
                    console.error('Błąd podczas pobierania danych:', error);
                });
        }

        handleDeleteClick(id) {
            this.setState({isFormVisible: false});
            // Usuń wpis o określonym ID
            axios
                .delete(`/checkouts/${id}`)
                .then(() => {
                    // Po usunięciu odśwież listę wypożyczeń
                    this.fetchCheckOuts();
                })
                .catch((error) => {
                    console.error('Błąd podczas usuwania danych:', error);
                });
        }

        handleEditClick(id) {
            const { checkOuts } = this.state;
            const checkOutToEdit = checkOuts.find(checkOut => checkOut.id === id);
            // Ustaw ID wpisu, który chcesz edytować
            if (checkOutToEdit) {
                this.setState({
                    editingId: id,
                    isEditing: id,
                    isFormVisible: false,
                    newCheckOut: {
                        ...checkOutToEdit, // Skopiuj istniejące dane
                        editedReturnDays: checkOutToEdit.returnDays, // Ustaw wartość początkową
                        editedBorrowerFullName: checkOutToEdit.borrowerFullName, // Ustaw wartość początkową
                    },
                });
            }
        }

        handleSaveClick(checkOut) {
            const { editedReturnDays, editedBorrowerFullName, ...rest } = this.state.newCheckOut;
            const updatedCheckOut = { ...checkOut, returnDays: editedReturnDays, borrowerFullName: editedBorrowerFullName, ...rest };
            // Zaktualizuj wpis o określonym ID
            axios
                .put(`/checkouts/${updatedCheckOut.id}`, updatedCheckOut)
                .then(() => {
                    this.fetchCheckOuts();
                    this.setState({ editingId: null });
                })
                .catch((error) => {
                    console.error('Błąd podczas zapisywania danych:', error);
                });
        }

        handleCancelClick() {
            // Anuluj edycję
            this.setState({editingId: null,isFormVisible: false});
        }


        handleInputChange(event, field) {
            // Obsługa zmiany wartości w formularzu
            const { newCheckOut } = this.state;
            if (field === 'bookId') {
                this.setState({
                    newCheckOut: {
                        ...newCheckOut,
                        [field]: event.target.value,
                    },
                    selectedBookId: event.target.value, // Ustaw selectedBookId
                });
            } else {
                this.setState({
                    newCheckOut: {
                        ...newCheckOut,
                        [field]: event.target.value,
                    },
                });
            }
        }

        handleAddClick() {
            // Dodaj nowy wpis
            axios
                .post('/checkouts', this.state.newCheckOut)
                .then(() => {
                    // Po dodaniu odśwież listę wypożyczeń
                    this.fetchCheckOuts();
                    // Zresetuj formularz
                    this.setState({
                        newCheckOut: {
                            bookId: '',
                            returnDays: '',
                            borrowerFullName: '',
                        },
                        isFormVisible: false,
                    });
                })
                .catch((error) => {
                    console.error('Błąd podczas dodawania danych:', error);
                });
        }

        renderPageNumbers() {
            const {currentPage, itemsPerPage, sortedCheckOuts} = this.state;
            const totalPages = Math.ceil(sortedCheckOuts.length / itemsPerPage);

            return (
                <div>
                    <center>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => this.setState({currentPage: currentPage - 1})}
                        >
                            &laquo; Poprzednia
                        </button>
                        <span> Strona {currentPage} z {totalPages} </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => this.setState({currentPage: currentPage + 1})}
                        >
                            Następna &raquo;
                        </button>
                    </center>
                </div>
            );
        }

        render() {
            const { editingId, newCheckOut, isFormVisible, books } = this.state;
            const currentCheckOuts = this.getCurrentCheckOuts();

            return (
                <div>
                    <Link to="/">
                        <button>Strona główna</button>
                    </Link>
                    <h1><center>Lista Wypożyczeń</center></h1>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tytuł Książki</th>
                            <th>Data Wypożyczenia</th>
                            <th>Dni Zwrotu</th>
                            <th>Imię i Nazwisko Wypożyczającego</th>
                            <th>Akcje</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentCheckOuts.map((checkOut) => (
                            <tr key={checkOut.id}>
                                <td>{checkOut.id}</td>
                                {editingId === checkOut.id ? (
                                    <>
                                        <td>
                                            <select
                                                value={newCheckOut.bookId}
                                                onChange={(e) => this.handleInputChange(e, 'bookId')}
                                            >
                                                <option value="">Wybierz książkę</option>
                                                {books.map((book) => (
                                                    <option key={book.id} value={book.id}>
                                                        {book.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <td>{format(new Date(checkOut.checkoutDate), "dd.MM.yyyy")}</td>
                                        </td>
                                        <td>
                                            {/* Dodaj inputy do edycji innych pól */}
                                            <input
                                                type="text"
                                                value={newCheckOut.returnDays}
                                                onChange={(e) => this.handleInputChange(e, 'returnDays')}
                                            />
                                        </td>
                                        <td>
                                            {/* Dodaj inputy do edycji innych pól */}
                                            <input
                                                type="text"
                                                value={newCheckOut.borrowerFullName}
                                                onChange={(e) => this.handleInputChange(e, 'borrowerFullName')}
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{checkOut.book.title}</td>
                                        <td>{format(new Date(checkOut.checkoutDate), "dd.MM.yyyy")}</td>
                                        <td>{checkOut.returnDays}</td>
                                        <td>{checkOut.borrowerFullName}</td>
                                    </>
                                )}
                                <td>
                                    {editingId === checkOut.id ? (
                                        <>
                                            <button
                                                onClick={() => this.handleSaveClick(checkOut)}
                                                className="save-button"
                                            >
                                                Zapisz
                                            </button>
                                            <button
                                                onClick={() => this.handleCancelClick()}
                                                className="cancel-button"
                                            >
                                                Anuluj
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => this.handleEditClick(checkOut.id)}
                                                className="edit-button"
                                            >
                                                Edytuj
                                            </button>
                                            <button
                                                onClick={() => this.handleDeleteClick(checkOut.id)}
                                                className="delete-button"
                                            >
                                                Usuń
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button onClick={() => this.setState({
                        isFormVisible: true,
                        newCheckOut: {
                            bookId: '',
                            returnDays: '',
                            borrowerFullName: '',
                        },
                    },this.handleCancelClick())}>
                        Dodaj nowy wpis
                    </button>

                    {isFormVisible && (
                        <div>
                            <h2>Dodaj Nowy Wpis</h2>
                            <div>
                                <label>Tytuł Książki:</label>
                                <select
                                    value={newCheckOut.bookId}
                                    onChange={(e) => this.handleInputChange(e, 'bookId')}
                                >
                                    <option value="">Wybierz książkę</option>
                                    {books.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.title}
                                        </option>
                                    ))}
                                </select>

                                <label>Imię i Nazwisko Wypożyczającego:</label>
                                <input
                                    type="text"
                                    value={newCheckOut.borrowerFullName}
                                    onChange={(e) => this.handleInputChange(e, 'borrowerFullName')}
                                />

                                <label>Dni Zwrotu:</label>
                                <input
                                    type="text"
                                    value={newCheckOut.returnDays}
                                    onChange={(e) => this.handleInputChange(e, 'returnDays')}
                                />
                            </div>
                            <button onClick={() => this.handleAddClick()}>Dodaj</button>
                            <button onClick={() => this.handleCancelClick()}className="cancel-button">Anuluj</button>
                        </div>
                    )}
                    <div className="pagination">
                        {this.renderPageNumbers()}
                    </div>
                </div>
            );
        }
    }

    export default CheckOutList;

