# JalRakshaka

## Project Overview

**JalRakshaka** is a community-driven water management platform designed to address local water issues such as leaks, contamination, and floods. Through an intuitive website, users can report problems, monitor statuses, receive personalized action plans, and access important resources like flood maps, groundwater data, and contact information for local authorities.

The project empowers citizens and authorities alike to ensure better water conservation and disaster response.

---

## Features

### User Side
- **Report Issues**: Easily report leaks, contamination, pipeline damage, or floods.
- **Track Status**: View the real-time status of reported issues.
- **Personalized Actions**: Get recommended action plans (e.g., "Call plumber", "Filter water", "Evacuate").
- **Weather Awareness**: Integrated live weather updates (rainfall, floods) via OpenWeatherMap API.
- **Live Map Visualization**: Multi-layer maps with pipeline issues, flood zones, and local water authorities.
- **Notices & Alerts**: Receive updates about water supply cuts, contamination alerts, and emergency notices.
- **Contact Directory**: Access verified contact numbers of local plumbers, tankers, and water authorities.

### Authority/Admin Side
- **Manage Reports**: View, update, and close water-related issue reports.
- **Dashboard Overview**: Visual analytics of issues by type, status, and location.
- **Geo-Visualization**: Interactive maps displaying household-level water concerns.
- **Notices Manager**: Send important announcements and alerts to citizens.

---

## Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **APIs Used**:
  - OpenWeatherMap API (Weather and flood data)
  - Leaflet.js (Mapping)
- **Cloud Deployment**: Vercel (or any preferred hosting service)

---

## Installation & Setup

### Prerequisites
- Node.js and npm installed
- Supabase (or local MongoDB setup)
- API keys for OpenWeatherMap and Gemini

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/JalRakshaka.git
   cd JalRakshaka
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add:
   ```
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

5. The application will be running at `http://localhost:5130/1/2/3/4/5`.

---

## Folder Structure

```
JalRakshaka/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── app.js
├── frontend/
│   ├── components/
│   ├── pages/
│   └── App.js
├── config/
│   └── db.js
├── .env
├── package.json
└── README.md
```

---

## Future Enhancements

- Real-time push notifications (PWA integration)
- SMS Alerts for emergency water-related situations
- AI-based water usage prediction for better planning
- Crowd-sourced groundwater level tracking
- Gamification: reward citizens for reporting issues

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- OpenWeatherMap for weather APIs
- Leaflet.js for interactive maps
- Inspiration from community-driven disaster management initiatives
