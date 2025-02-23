import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/css/mytrips.css";
import { useNavigate } from "react-router-dom";

function MyTrips() {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [destinationData, setDestinationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id"); // Assuming user_id is stored in localStorage

    const navigate = useNavigate();

    useEffect(() => {
        fetchTrips();
        fetchDestinations();
    }, []);

    const [newTrip, setNewTrip] = useState({
        trip_name: "",
        start_date: "",
        end_date: "",
        destination_id: "",
        total_budget: "",
    });

    const handleInputChange = (e) => {
        setNewTrip({ ...newTrip, [e.target.name]: e.target.value });
    };

    const handleAddTrip = async (e) => {
        e.preventDefault();

        // Ensure user_id is included in the request if required
        const tripData = {
            ...newTrip,
            user_id: userId,  // Include the user_id here
        };

        try {
            await axios.post(
                "http://127.0.0.1:8000/trips/trips/",
                tripData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Trip added successfully!");
            setNewTrip({
                trip_name: "",
                start_date: "",
                end_date: "",
                destination_id: "",
                total_budget: "",
            });

            fetchTrips();
        } catch (error) {
            console.error("Error adding trip:", error);
            alert("Failed to add trip. Please try again.");
        }
    };

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://127.0.0.1:8000/trips/trips/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTrips(response.data);
        } catch (error) {
            console.error("Error fetching trips:", error);
            alert("Failed to fetch trips. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/destinations/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDestinationData(response.data);
        } catch (error) {
            console.error("Error fetching destinations:", error);
            alert("Failed to fetch destinations. Please try again.");
        }
    };

    const handlePlansClick = (tripId) => {
        // Redirect to the activities page with the trip ID
        navigate(`/plans/${tripId}`);
    };

    const handleDeleteTrip = async (tripId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this trip?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/trips/trips/${tripId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("Trip deleted successfully!");
            fetchTrips();
            setSelectedTrip(null);
        } catch (error) {
            console.error("Error deleting trip:", error);
            alert("Failed to delete trip. Please try again.");
        }
    };

    const handleCardClick = (trip) => {
        setSelectedTrip(trip);
    };

    const closeModal = () => {
        setSelectedTrip(null);
    };

    const handleEditClick = (id) => {
        navigate(`/edittrip/${id}`);
    };

    if (loading) {
        return <p>Loading your trips...</p>;
    }

    return (
        <div>
            <h1>My Trips</h1>

            {/* Add Trip Form */}
            <div className="add-trip-form">
                <h2>Add a New Trip</h2>
                <form onSubmit={handleAddTrip}>
                    <input
                        type="text"
                        name="trip_name"
                        placeholder="Trip Name"
                        value={newTrip.trip_name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="date"
                        name="start_date"
                        placeholder="Start Date"
                        value={newTrip.start_date}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="date"
                        name="end_date"
                        placeholder="End Date"
                        value={newTrip.end_date}
                        onChange={handleInputChange}
                        required
                    />

                    {/* Destination Selection Dropdown */}
                    <select
                        name="destination_id"
                        value={newTrip.destination_id}
                        onChange={handleInputChange}
                        required
                        className="form-select"
                    >
                        <option value="">Select Destination</option>
                        {destinationData.map((destination) => (
                            <option key={destination.id} value={destination.id}>
                                {destination.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="total_budget"
                        placeholder="Total Budget"
                        value={newTrip.total_budget}
                        onChange={handleInputChange}
                        required
                    />
                    <button type="submit">Add Trip</button>
                </form>
            </div>

            {/* Trip Cards */}
            <div className="card-container">
                {trips.map((trip) => (
                    <div
                        key={trip.id}
                        className="trip-card"
                        onClick={() => handleCardClick(trip)}
                    >
                        <h3>{trip.trip_name}</h3>
                        <p>Start Date: {trip.start_date}</p>
                        <p>End Date: {trip.end_date}</p>
                        {destinationData.find((d) => d.id === trip.destination_id) ? (
                            <>
                                <h4 className="destination-name">
                                    {destinationData.find((d) => d.id === trip.destination_id).name}
                                </h4>
                                <img
                                    src={destinationData.find((d) => d.id === trip.destination_id).image_url}
                                    alt="Destination"
                                    className="destination-image"
                                />
                            </>
                        ) : (
                            <p>No image available</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal Popup */}
            {selectedTrip && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-btn" onClick={closeModal}>&times;</span>
                        <h2>{selectedTrip.trip_name}</h2>
                        <p><strong>Destination:</strong> {destinationData.find((d) => d.id === selectedTrip.destination_id)?.name}</p>
                        <p><strong>Start Date:</strong> {selectedTrip.start_date}</p>
                        <p><strong>End Date:</strong> {selectedTrip.end_date}</p>
                        <p><strong>Total Budget:</strong> {selectedTrip.total_budget}</p>

                        <button className="edit-btn" onClick={() => handleEditClick(selectedTrip.id)}>Edit Trip</button>
                        <button className="edit-btn" onClick={() => handlePlansClick(selectedTrip.id)}>Plan My Trip</button>
                        <button className="delete-btn" onClick={() => handleDeleteTrip(selectedTrip.id)}>Delete Trip</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyTrips;
