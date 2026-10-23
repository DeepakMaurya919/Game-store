import { useState, useEffect } from "react";
import "./App.css";

// Global Sound & BGM Toggle State
let soundEnabled = true;
let bgmAudioCtx = null;
let bgmInterval = null;

const playSound = (type) => {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "click") {
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } else if (type === "win") {
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      setTimeout(
        () => osc.frequency.setValueAtTime(880, audioCtx.currentTime),
        120,
      );
      setTimeout(
        () => osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime),
        240,
      );
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === "bonus") {
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      setTimeout(
        () => osc.frequency.setValueAtTime(659.25, audioCtx.currentTime),
        100,
      );
      setTimeout(
        () => osc.frequency.setValueAtTime(783.99, audioCtx.currentTime),
        200,
      );
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {}
};

// Retro BGM Synthesizer Generator
const toggleBGM = (play) => {
  if (!play) {
    if (bgmInterval) clearInterval(bgmInterval);
    if (bgmAudioCtx) bgmAudioCtx.close();
    bgmAudioCtx = null;
    return;
  }
  try {
    bgmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [261.63, 329.63, 392.0, 523.25];
    let index = 0;
    bgmInterval = setInterval(() => {
      if (!bgmAudioCtx || bgmAudioCtx.state === "closed") return;
      const osc = bgmAudioCtx.createOscillator();
      const gain = bgmAudioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(notes[index], bgmAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, bgmAudioCtx.currentTime);
      osc.connect(gain);
      gain.connect(bgmAudioCtx.destination);
      osc.start();
      osc.stop(bgmAudioCtx.currentTime + 0.2);
      index = (index + 1) % notes.length;
    }, 400);
  } catch (e) {}
};

// Premium Confetti Effect
const triggerConfetti = () => {
  const colors = [
    "#8b5cf6",
    "#c4b5fd",
    "#6366f1",
    "#ec4899",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
  ];
  for (let i = 0; i < 55; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-10px";
    confetti.style.width = Math.random() * 10 + 5 + "px";
    confetti.style.height = Math.random() * 10 + 5 + "px";
    confetti.style.background =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    confetti.style.zIndex = "9999";
    confetti.style.transition = "all 1.3s cubic-bezier(0.25, 1, 0.5, 1)";
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = window.innerHeight + 50 + "px";
      confetti.style.transform = `translateX(${(Math.random() - 0.5) * 250}px) rotate(${Math.random() * 720}deg)`;
      confetti.style.opacity = "0";
    }, 20);

    setTimeout(() => confetti.remove(), 1300);
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem("game_current_user") || null,
  );
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [search, setSearch] = useState("");
  const [activeGame, setActiveGame] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'games', 'favorites', 'stats', 'trophies'
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(null);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [achievementPopup, setAchievementPopup] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmPlaying, setBgmPlaying] = useState(false);

  // Session Timer State
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Theme & Mode State
  const [currentTheme, setCurrentTheme] = useState("purple");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Persistent Stats, XP & Favorites
  const [totalWins, setTotalWins] = useState(
    () => parseInt(localStorage.getItem("game_wins")) || 0,
  );
  const [totalLosses, setTotalLosses] = useState(
    () => parseInt(localStorage.getItem("game_losses")) || 0,
  );
  const [totalPoints, setTotalPoints] = useState(
    () => parseInt(localStorage.getItem("game_points")) || 0,
  );
  const [badges, setBadges] = useState(
    () => JSON.parse(localStorage.getItem("game_badges")) || [],
  );
  const [xp, setXp] = useState(
    () => parseInt(localStorage.getItem("game_xp")) || 20,
  );
  const [dailyCompleted, setDailyCompleted] = useState(
    () => localStorage.getItem("daily_completed") === "true",
  );
  const [favorites, setFavorites] = useState(
    () => JSON.parse(localStorage.getItem("game_favorites")) || [],
  );

  // Live Session Timer effect
  useEffect(() => {
    if (!currentUser) return;
    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentUser]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      if (e.key.toLowerCase() === "d") {
        setActiveTab("dashboard");
        playSound("click");
      }
      if (e.key.toLowerCase() === "f") {
        setActiveTab("favorites");
        playSound("click");
      }
      if (e.key.toLowerCase() === "s") {
        setActiveTab("stats");
        playSound("click");
      }
      if (e.key.toLowerCase() === "t") {
        setActiveTab("trophies");
        playSound("click");
      }
      if (e.key.toLowerCase() === "m") {
        toggleSound();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem("game_wins", totalWins);
    localStorage.setItem("game_losses", totalLosses);
    localStorage.setItem("game_points", totalPoints);
    localStorage.setItem("game_badges", JSON.stringify(badges));
    localStorage.setItem("game_xp", xp);
    localStorage.setItem("daily_completed", dailyCompleted);
    localStorage.setItem("game_favorites", JSON.stringify(favorites));
    if (currentUser) {
      localStorage.setItem("game_current_user", currentUser);
    } else {
      localStorage.removeItem("game_current_user");
    }
  }, [
    currentUser,
    totalWins,
    totalLosses,
    totalPoints,
    badges,
    xp,
    dailyCompleted,
    favorites,
  ]);

  useEffect(() => {
    if (currentUser) {
      const lastClaimed = localStorage.getItem("last_daily_bonus");
      const today = new Date().toDateString();
      if (lastClaimed !== today) {
        setShowBonusModal(true);
      }
    }
  }, [currentUser]);

  const triggerAchievement = (title) => {
    setAchievementPopup(title);
    setTimeout(() => setAchievementPopup(null), 3500);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    playSound("click");
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setCurrentUser(usernameInput);
    setAuthError("");
  };

  const handleLogout = () => {
    playSound("click");
    toggleBGM(false);
    setBgmPlaying(false);
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
  };

  const claimDailyBonus = () => {
    playSound("bonus");
    triggerConfetti();
    setTotalPoints((prev) => prev + 150);
    setXp((prev) => Math.min(100, prev + 30));
    localStorage.setItem("last_daily_bonus", new Date().toDateString());
    setShowBonusModal(false);
    triggerAchievement("🎁 Daily Login Bonus Claimed!");
  };

  const addWinAndPoints = (points) => {
    const newWins = totalWins + 1;
    setTotalWins(newWins);
    setTotalPoints((prev) => prev + points);
    setXp((prev) => Math.min(100, prev + 25));
    triggerConfetti();
    playSound("win");

    const newBadges = [...badges];
    if (newWins === 1 && !newBadges.includes("🎯 First Win")) {
      newBadges.push("🎯 First Win");
      triggerAchievement("Unlocked Badge: First Win! 🎯");
    }
    if (newWins >= 3 && !newBadges.includes("⭐ Pro Gamer")) {
      newBadges.push("⭐ Pro Gamer");
      triggerAchievement("Unlocked Badge: Pro Gamer! ⭐");
    }
    if (totalPoints + points >= 200 && !newBadges.includes("🔥 Elite Master")) {
      newBadges.push("🔥 Elite Master");
      triggerAchievement("Unlocked Badge: Elite Master! 🔥");
    }
    setBadges(newBadges);
  };

  const addLoss = () => {
    setTotalLosses((prev) => prev + 1);
  };

  const toggleSound = () => {
    soundEnabled = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleBGMPlayer = () => {
    const nextState = !bgmPlaying;
    setBgmPlaying(nextState);
    toggleBGM(nextState);
    triggerAchievement(
      nextState ? "🎵 Arcade BGM Started" : "🔇 Arcade BGM Muted",
    );
  };

  const toggleFavorite = (gameId) => {
    playSound("click");
    if (favorites.includes(gameId)) {
      setFavorites(favorites.filter((id) => id !== gameId));
    } else {
      setFavorites([...favorites, gameId]);
      triggerAchievement("Added to Favorites ⭐");
    }
  };

  const completeDailyChallenge = () => {
    if (!dailyCompleted) {
      setDailyCompleted(true);
      setTotalPoints((prev) => prev + 100);
      setXp((prev) => Math.min(100, prev + 20));
      triggerConfetti();
      playSound("bonus");
      triggerAchievement("🔥 Daily Challenge Completed (+100 pts)");
    }
  };

  const exportGameReport = () => {
    playSound("click");
    const reportData = {
      username: currentUser,
      totalWins,
      totalLosses,
      totalPoints,
      badges,
      xpLevel: `${xp}%`,
      exportDate: new Date().toLocaleString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentUser}_GameHub_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerAchievement("📄 Game Report Downloaded Successfully!");
  };

  const themes = {
    purple: {
      primary: "#8b5cf6",
      secondary: "#6366f1",
      badge: "#c4b5fd",
      heroGrad: "linear-gradient(135deg, #2d1b5c, #111320 70%, #1f1b3c)",
    },
    green: {
      primary: "#10b981",
      secondary: "#059669",
      badge: "#6ee7b7",
      heroGrad: "linear-gradient(135deg, #064e3b, #111320 70%, #065f46)",
    },
    blue: {
      primary: "#3b82f6",
      secondary: "#1d4ed8",
      badge: "#93c5fd",
      heroGrad: "linear-gradient(135deg, #1e3a8a, #111320 70%, #1e40af)",
    },
    pink: {
      primary: "#ec4899",
      secondary: "#be185d",
      badge: "#f472b6",
      heroGrad: "linear-gradient(135deg, #831843, #111320 70%, #9d174d)",
    },
  };

  const theme = themes[currentTheme];

  const modeStyles = {
    bg: isDarkMode ? "#0b0d17" : "#f4f5f9",
    cardBg: isDarkMode ? "#141725" : "#ffffff",
    textColor: isDarkMode ? "#ffffff" : "#1f2937",
    subText: isDarkMode ? "#8c91a8" : "#6b7280",
    borderCol: isDarkMode ? "#25283a" : "#e5e7eb",
    sidebarBg: isDarkMode ? "#111320" : "#ffffff",
  };

  const games = [
    {
      id: 1,
      name: "Tic Tac Toe",
      category: "Puzzle",
      icon: "⭕",
      color: "game-purple",
      rules:
        "Take turns placing X and O on the 3x3 grid. Get 3 in a row horizontally, vertically, or diagonally to win!",
    },
    {
      id: 2,
      name: "Rock Paper Scissors",
      category: "Arcade",
      icon: "✊",
      color: "game-blue",
      rules:
        "Rock beats Scissors, Scissors beats Paper, and Paper beats Rock. Defeat the computer to score points!",
    },
    {
      id: 3,
      name: "Memory Match",
      category: "Brain Game",
      icon: "🧠",
      color: "game-pink",
      rules:
        "Flip cards to find matching pairs of emojis. Match all pairs in the fewest attempts to win!",
    },
    {
      id: 4,
      name: "Number Guess",
      category: "Logic",
      icon: "🔢",
      color: "game-orange",
      rules:
        "Guess the hidden number between 1 and 10 based on the hints provided (Too high / Too low).",
    },
    {
      id: 5,
      name: "Snake Game",
      category: "Arcade",
      icon: "🐍",
      color: "game-purple",
      rules:
        "Eat food items to grow your snake without hitting the walls or yourself!",
    },
    {
      id: 6,
      name: "Quiz Challenge",
      category: "Trivia",
      icon: "❓",
      color: "game-blue",
      rules:
        "Answer quick tech and gaming trivia questions correctly to score points!",
    },
    {
      id: 7,
      name: "Reaction Timer",
      category: "Reflex",
      icon: "⚡",
      color: "game-orange",
      rules:
        "Wait for the box to turn green, then click as fast as possible to test your reflexes!",
    },
  ];

  const allTrophiesList = [
    { name: "🎯 First Win", desc: "Win your very first mini-game." },
    { name: "⭐ Pro Gamer", desc: "Achieve 3 or more total wins." },
    { name: "🔥 Elite Master", desc: "Accumulate 200+ total points." },
  ];

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(search.toLowerCase());
    if (activeTab === "favorites") {
      return matchesSearch && favorites.includes(game.id);
    }
    return matchesSearch;
  });

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}m ${remSecs < 10 ? "0" : ""}${remSecs}s`;
  };

  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: modeStyles.bg,
          display: "grid",
          placeItems: "center",
          fontFamily: "Poppins, sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            background: modeStyles.cardBg,
            border: `1px solid ${modeStyles.borderCol}`,
            borderRadius: "20px",
            padding: "35px 25px",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              marginBottom: "5px",
              color: modeStyles.textColor,
            }}
          >
            🎮 Game<span style={{ color: "#8b5cf6" }}>Hub</span>
          </h2>
          <p
            style={{
              color: modeStyles.subText,
              fontSize: "13px",
              marginBottom: "25px",
            }}
          >
            Login to your gaming account
          </p>

          {authError && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "12px",
                marginBottom: "15px",
              }}
            >
              {authError}
            </p>
          )}

          <form
            onSubmit={handleAuthSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="text"
              placeholder="Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px",
                background: isDarkMode ? "#1c1930" : "#f9fafb",
                border: `1px solid ${modeStyles.borderCol}`,
                borderRadius: "10px",
                color: modeStyles.textColor,
                outline: "none",
                fontSize: "14px",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px",
                background: isDarkMode ? "#1c1930" : "#f9fafb",
                border: `1px solid ${modeStyles.borderCol}`,
                borderRadius: "10px",
                color: modeStyles.textColor,
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(100deg, #8b5cf6, #6366f1)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                marginTop: "5px",
              }}
            >
              Login to Dashboard →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="app"
      style={{ background: modeStyles.bg, color: modeStyles.textColor }}
    >
      {achievementPopup && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: modeStyles.cardBg,
            border: `2px solid ${theme.primary}`,
            color: modeStyles.textColor,
            padding: "12px 20px",
            borderRadius: "12px",
            zIndex: 99999,
            boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
          }}
        >
          <p style={{ fontSize: "11px", color: theme.badge, margin: 0 }}>
            🏆 NOTIFICATION
          </p>
          <p
            style={{ fontSize: "14px", fontWeight: "bold", margin: "3px 0 0" }}
          >
            {achievementPopup}
          </p>
        </div>
      )}

      <aside
        className="sidebar"
        style={{
          background: modeStyles.sidebarBg,
          borderRight: `1px solid ${modeStyles.borderCol}`,
        }}
      >
        <h2 className="logo" style={{ color: modeStyles.textColor }}>
          🎮 Game<span style={{ color: theme.primary }}>Hub</span>
        </h2>

        <p className="menu-title" style={{ color: modeStyles.subText }}>
          NAVIGATION
        </p>

        <button
          className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => {
            playSound("click");
            setActiveTab("dashboard");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{ color: modeStyles.textColor }}
        >
          🏠 Dashboard{" "}
          <span style={{ fontSize: "10px", opacity: 0.5, marginLeft: "auto" }}>
            [D]
          </span>
        </button>

        <button
          className={`menu-item ${activeTab === "games" ? "active" : ""}`}
          onClick={() => {
            playSound("click");
            setActiveTab("games");
            setSearch("");
          }}
          style={{ color: modeStyles.textColor }}
        >
          🎯 All Games
        </button>

        <button
          className={`menu-item ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => {
            playSound("click");
            setActiveTab("favorites");
            setSearch("");
          }}
          style={{ color: modeStyles.textColor }}
        >
          ⭐ Favorites ({favorites.length}){" "}
          <span style={{ fontSize: "10px", opacity: 0.5, marginLeft: "auto" }}>
            [F]
          </span>
        </button>

        <button
          className={`menu-item ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => {
            playSound("click");
            setActiveTab("stats");
          }}
          style={{ color: modeStyles.textColor }}
        >
          📊 Statistics{" "}
          <span style={{ fontSize: "10px", opacity: 0.5, marginLeft: "auto" }}>
            [S]
          </span>
        </button>

        <button
          className={`menu-item ${activeTab === "trophies" ? "active" : ""}`}
          onClick={() => {
            playSound("click");
            setActiveTab("trophies");
          }}
          style={{ color: modeStyles.textColor }}
        >
          🏅 Trophies ({badges.length}/{allTrophiesList.length}){" "}
          <span style={{ fontSize: "10px", opacity: 0.5, marginLeft: "auto" }}>
            [T]
          </span>
        </button>

        <button
          className="menu-item"
          onClick={() => {
            playSound("click");
            setShowLeaderboardModal(true);
          }}
          style={{ color: modeStyles.textColor }}
        >
          🏆 Leaderboard
        </button>

        <button
          className="menu-item"
          onClick={() => {
            playSound("click");
            setShowSettingsModal(true);
          }}
          style={{ color: modeStyles.textColor }}
        >
          ⚙️ Settings
        </button>

        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            background: isDarkMode ? "#1c1930" : "#f3f4f6",
            borderRadius: "12px",
            border: `1px solid ${modeStyles.borderCol}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              marginBottom: "6px",
            }}
          >
            <span style={{ color: modeStyles.subText }}>RANK XP</span>
            <span style={{ color: theme.primary, fontWeight: "bold" }}>
              {xp}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: isDarkMode ? "#111320" : "#e5e7eb",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${xp}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      </aside>

      <main className="main" style={{ background: modeStyles.bg }}>
        <header
          className="navbar"
          style={{ borderBottom: `1px solid ${modeStyles.borderCol}` }}
        >
          <div>
            <p className="welcome" style={{ color: theme.primary }}>
              WELCOME BACK, {currentUser.toUpperCase()}!
            </p>
            <h1 style={{ color: modeStyles.textColor }}>
              Gaming Dashboard Pro
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Live Session Stopwatch Pill */}
            <div
              style={{
                background: modeStyles.cardBg,
                border: `1px solid ${modeStyles.borderCol}`,
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                color: modeStyles.subText,
              }}
            >
              ⏱️ Session:{" "}
              <strong style={{ color: theme.primary }}>
                {formatTime(sessionSeconds)}
              </strong>
            </div>

            <button
              onClick={toggleBGMPlayer}
              style={{
                background: modeStyles.cardBg,
                border: `1px solid ${modeStyles.borderCol}`,
                color: modeStyles.textColor,
                padding: "8px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {bgmPlaying ? "🎵 BGM: ON" : "🔇 BGM: OFF"}
            </button>

            <button
              onClick={toggleSound}
              style={{
                background: modeStyles.cardBg,
                border: `1px solid ${modeStyles.borderCol}`,
                color: modeStyles.textColor,
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            <div
              className="profile"
              style={{ cursor: "pointer" }}
              onClick={() => setShowProfileModal(true)}
            >
              <div className="avatar">🎮</div>
              <div>
                <strong style={{ color: modeStyles.textColor }}>
                  {currentUser}
                </strong>
                <p style={{ color: theme.primary }}>Level 01 Gamer</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === "stats" ? (
          <section
            style={{
              background: modeStyles.cardBg,
              border: `1px solid ${modeStyles.borderCol}`,
              borderRadius: "16px",
              padding: "30px",
              marginTop: "20px",
            }}
          >
            <h2 style={{ color: modeStyles.textColor }}>
              📊 Player Performance Statistics
            </h2>
            <p
              style={{
                color: modeStyles.subText,
                fontSize: "13px",
                marginBottom: "25px",
              }}
            >
              Real-time win/loss analytics & gameplay metrics.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  background: isDarkMode ? "#1c1930" : "#f9fafb",
                  padding: "20px",
                  borderRadius: "12px",
                  border: `1px solid ${modeStyles.borderCol}`,
                }}
              >
                <p style={{ color: modeStyles.subText, fontSize: "12px" }}>
                  Total Matches
                </p>
                <h2
                  style={{
                    fontSize: "28px",
                    marginTop: "5px",
                    color: modeStyles.textColor,
                  }}
                >
                  {totalWins + totalLosses}
                </h2>
              </div>
              <div
                style={{
                  background: isDarkMode ? "#1c1930" : "#f9fafb",
                  padding: "20px",
                  borderRadius: "12px",
                  border: `1px solid ${modeStyles.borderCol}`,
                }}
              >
                <p style={{ color: modeStyles.subText, fontSize: "12px" }}>
                  Win Rate (%)
                </p>
                <h2
                  style={{
                    fontSize: "28px",
                    marginTop: "5px",
                    color: "#10b981",
                  }}
                >
                  {totalWins + totalLosses > 0
                    ? Math.round((totalWins / (totalWins + totalLosses)) * 100)
                    : 0}
                  %
                </h2>
              </div>
              <div
                style={{
                  background: isDarkMode ? "#1c1930" : "#f9fafb",
                  padding: "20px",
                  borderRadius: "12px",
                  border: `1px solid ${modeStyles.borderCol}`,
                }}
              >
                <p style={{ color: modeStyles.subText, fontSize: "12px" }}>
                  Badges Unlocked
                </p>
                <h2
                  style={{
                    fontSize: "28px",
                    marginTop: "5px",
                    color: theme.primary,
                  }}
                >
                  {badges.length}
                </h2>
              </div>
            </div>

            <button
              onClick={exportGameReport}
              style={{
                padding: "10px 20px",
                background: `linear-gradient(100deg, ${theme.primary}, ${theme.secondary})`,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              📄 Export Game Report (.JSON)
            </button>
          </section>
        ) : activeTab === "trophies" ? (
          /* TROPHIES & BADGES CABINET TAB */
          <section
            style={{
              background: modeStyles.cardBg,
              border: `1px solid ${modeStyles.borderCol}`,
              borderRadius: "16px",
              padding: "30px",
              marginTop: "20px",
            }}
          >
            <h2 style={{ color: modeStyles.textColor }}>
              🏅 Trophies & Achievements Cabinet
            </h2>
            <p
              style={{
                color: modeStyles.subText,
                fontSize: "13px",
                marginBottom: "25px",
              }}
            >
              Complete milestone achievements across games to unlock cabinet
              rewards!
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "15px",
              }}
            >
              {allTrophiesList.map((t, idx) => {
                const isUnlocked = badges.includes(t.name);
                return (
                  <div
                    key={idx}
                    style={{
                      background: isUnlocked
                        ? isDarkMode
                          ? "#1c1930"
                          : "#f0fdf4"
                        : isDarkMode
                          ? "#111320"
                          : "#f9fafb",
                      border: `1px solid ${isUnlocked ? theme.primary : modeStyles.borderCol}`,
                      borderRadius: "12px",
                      padding: "20px",
                      opacity: isUnlocked ? 1 : 0.6,
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 6px",
                        fontSize: "16px",
                        color: modeStyles.textColor,
                      }}
                    >
                      {t.name}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 12px",
                        fontSize: "12px",
                        color: modeStyles.subText,
                      }}
                    >
                      {t.desc}
                    </p>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        background: isUnlocked
                          ? `${theme.primary}33`
                          : "#374151",
                        color: isUnlocked ? theme.primary : "#9ca3af",
                      }}
                    >
                      {isUnlocked ? "UNLOCKED ✅" : "LOCKED 🔒"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <>
            <section
              className="hero"
              style={{
                background: theme.heroGrad,
                boxShadow: `0 10px 30px ${theme.primary}22`,
              }}
            >
              <div className="hero-content">
                <span
                  className="badge"
                  style={{
                    color: theme.badge,
                    background: `${theme.primary}22`,
                    borderColor: `${theme.primary}55`,
                  }}
                >
                  ⚡ ULTIMATE GAMING ZONE
                </span>

                <h2>
                  Level Up Your
                  <br />
                  <span style={{ color: theme.badge }}>Gaming Experience!</span>
                </h2>

                <p>
                  Play exciting mini-games, challenge your reflexes, beat your
                  high scores and unlock exclusive trophies.
                </p>

                <button
                  className="play-button"
                  style={{
                    background: `linear-gradient(100deg, ${theme.primary}, ${theme.secondary})`,
                    boxShadow: `0 4px 15px ${theme.primary}55`,
                  }}
                  onClick={() => {
                    playSound("click");
                    document
                      .getElementById("games")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Explore Games →
                </button>
              </div>

              <div className="hero-emoji">🚀</div>
            </section>

            <section
              style={{
                margin: "25px 0",
                background: modeStyles.cardBg,
                border: `1px solid ${theme.primary}55`,
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <div>
                <span
                  style={{
                    background: `${theme.primary}33`,
                    color: theme.primary,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  🔥 DAILY CHALLENGE
                </span>
                <h3
                  style={{
                    margin: "8px 0 4px",
                    fontSize: "18px",
                    color: modeStyles.textColor,
                  }}
                >
                  Play any 1 Game & Score Points
                </h3>
                <p style={{ color: modeStyles.subText, fontSize: "12px" }}>
                  Complete today's challenge to earn +100 bonus points & XP!
                </p>
              </div>
              <button
                onClick={completeDailyChallenge}
                disabled={dailyCompleted}
                style={{
                  padding: "10px 20px",
                  background: dailyCompleted
                    ? isDarkMode
                      ? "#25283a"
                      : "#e5e7eb"
                    : `linear-gradient(100deg, ${theme.primary}, ${theme.secondary})`,
                  color: dailyCompleted ? modeStyles.subText : "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: dailyCompleted ? "default" : "pointer",
                }}
              >
                {dailyCompleted ? "Completed ✅" : "Claim Challenge 🎁"}
              </button>
            </section>

            <section className="stats">
              <div
                className="stat-card"
                style={{
                  background: modeStyles.cardBg,
                  border: `1px solid ${modeStyles.borderCol}`,
                }}
              >
                <span>🎯</span>
                <div>
                  <p style={{ color: modeStyles.subText }}>Available Games</p>
                  <h2 style={{ color: modeStyles.textColor }}>07</h2>
                </div>
              </div>

              <div
                className="stat-card"
                style={{
                  background: modeStyles.cardBg,
                  border: `1px solid ${modeStyles.borderCol}`,
                }}
              >
                <span>🏆</span>
                <div>
                  <p style={{ color: modeStyles.subText }}>Total Wins</p>
                  <h2 style={{ color: modeStyles.textColor }}>
                    {String(totalWins).padStart(2, "0")}
                  </h2>
                </div>
              </div>

              <div
                className="stat-card"
                style={{
                  background: modeStyles.cardBg,
                  border: `1px solid ${modeStyles.borderCol}`,
                }}
              >
                <span>⭐</span>
                <div>
                  <p style={{ color: modeStyles.subText }}>Total Points</p>
                  <h2 style={{ color: modeStyles.textColor }}>
                    {String(totalPoints).padStart(3, "0")}
                  </h2>
                </div>
              </div>
            </section>

            <section className="games-section" id="games">
              <div className="section-heading">
                <div>
                  <p className="welcome" style={{ color: theme.primary }}>
                    PICK YOUR FAVORITE
                  </p>
                  <h2 style={{ color: modeStyles.textColor }}>
                    {activeTab === "favorites"
                      ? "Favorite Games ⭐"
                      : "Popular Games"}
                  </h2>
                </div>

                <input
                  type="text"
                  placeholder="🔍 Search games..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{
                    background: modeStyles.cardBg,
                    color: modeStyles.textColor,
                    border: `1px solid ${modeStyles.borderCol}`,
                  }}
                />
              </div>

              <div className="games-grid">
                {filteredGames.map((game) => {
                  const isFav = favorites.includes(game.id);
                  return (
                    <div
                      className="game-card"
                      key={game.id}
                      style={{
                        background: modeStyles.cardBg,
                        borderColor:
                          activeGame?.id === game.id
                            ? theme.primary
                            : modeStyles.borderCol,
                      }}
                    >
                      <div className={`game-art ${game.color}`}>
                        <span>{game.icon}</span>
                      </div>

                      <div className="game-info">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <p style={{ color: theme.primary }}>
                            {game.category}
                          </p>
                          <button
                            onClick={() => toggleFavorite(game.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              fontSize: "16px",
                              cursor: "pointer",
                            }}
                          >
                            {isFav ? "❤️" : "🤍"}
                          </button>
                        </div>
                        <h3 style={{ color: modeStyles.textColor }}>
                          {game.name}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            marginTop: "10px",
                          }}
                        >
                          <button
                            className="game-button"
                            style={{
                              flex: 1,
                              background: isDarkMode ? "#21253a" : "#f3f4f6",
                              color: modeStyles.textColor,
                              border: `1px solid ${theme.primary}44`,
                            }}
                            onClick={() => {
                              playSound("click");
                              setActiveGame(game);
                            }}
                          >
                            Play Now →
                          </button>
                          <button
                            onClick={() => {
                              playSound("click");
                              setShowRulesModal(game);
                            }}
                            style={{
                              background: "transparent",
                              border: `1px solid ${modeStyles.borderCol}`,
                              borderRadius: "8px",
                              padding: "0 10px",
                              color: modeStyles.textColor,
                              cursor: "pointer",
                            }}
                          >
                            ℹ️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredGames.length === 0 && (
                <p className="no-games" style={{ color: modeStyles.subText }}>
                  No games found in this view!
                </p>
              )}
            </section>
          </>
        )}

        <footer style={{ borderTop: `1px solid ${modeStyles.borderCol}` }}>
          <p style={{ color: modeStyles.subText }}>
            © 2026 GameHub Pro | College Project built with React JS 💜
          </p>
        </footer>
      </main>

      {/* GAME MODAL */}
      {activeGame && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              background: modeStyles.cardBg,
              color: modeStyles.textColor,
              borderColor: `${theme.primary}66`,
              maxWidth: activeGame.id === 5 ? "450px" : "400px",
            }}
          >
            <button
              className="close-button"
              onClick={() => {
                playSound("click");
                setActiveGame(null);
              }}
              style={{ color: modeStyles.textColor }}
            >
              ✕
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "28px" }}>{activeGame.icon}</span>
              <h2 style={{ margin: 0, color: modeStyles.textColor }}>
                {activeGame.name}
              </h2>
            </div>

            <div style={{ margin: "15px 0" }}>
              {activeGame.id === 1 && (
                <TicTacToe
                  onWin={() => addWinAndPoints(50)}
                  onLoss={addLoss}
                  primaryColor={theme.primary}
                />
              )}
              {activeGame.id === 2 && (
                <RockPaperScissors
                  onWin={() => addWinAndPoints(20)}
                  onLoss={addLoss}
                  primaryColor={theme.primary}
                />
              )}
              {activeGame.id === 3 && (
                <MemoryMatch
                  onWin={() => addWinAndPoints(40)}
                  primaryColor={theme.primary}
                />
              )}
              {activeGame.id === 4 && (
                <NumberGuess
                  onWin={() => addWinAndPoints(30)}
                  primaryColor={theme.primary}
                />
              )}
              {activeGame.id === 5 && (
                <SnakeGame
                  onWin={() => addWinAndPoints(50)}
                  primaryColor={theme.primary}
                />
              )}
              {activeGame.id === 6 && (
                <QuizChallenge
                  onWin={() => addWinAndPoints(40)}
                  primaryColor={theme.primary}
                />
              )}
              {activeGame.id === 7 && (
                <ReactionTimer
                  onWin={() => addWinAndPoints(35)}
                  primaryColor={theme.primary}
                />
              )}
            </div>

            <button
              className="play-button"
              style={{
                marginTop: "15px",
                width: "100%",
                background: `linear-gradient(100deg, ${theme.primary}, ${theme.secondary})`,
              }}
              onClick={() => {
                playSound("click");
                setActiveGame(null);
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              background: modeStyles.cardBg,
              color: modeStyles.textColor,
            }}
          >
            <button
              className="close-button"
              onClick={() => setShowSettingsModal(false)}
              style={{ color: modeStyles.textColor }}
            >
              ✕
            </button>
            <div style={{ fontSize: "35px", marginBottom: "5px" }}>⚙️</div>
            <h2 style={{ color: modeStyles.textColor }}>Settings</h2>
            <p
              style={{
                color: modeStyles.subText,
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              Customize your dashboard preferences
            </p>

            <div
              style={{
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: isDarkMode ? "#21253a" : "#f3f4f6",
                  padding: "12px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "13px" }}>Appearance Mode</span>
                <button
                  onClick={() => {
                    playSound("click");
                    setIsDarkMode(!isDarkMode);
                  }}
                  style={{
                    padding: "6px 12px",
                    background: theme.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {isDarkMode ? "Dark Mode 🌙" : "Light Mode ☀️"}
                </button>
              </div>

              <div
                style={{
                  background: isDarkMode ? "#21253a" : "#f3f4f6",
                  padding: "12px",
                  borderRadius: "10px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: modeStyles.subText,
                    marginBottom: "8px",
                  }}
                >
                  ACCENT THEME
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  {Object.keys(themes).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        playSound("click");
                        setCurrentTheme(t);
                      }}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border:
                          currentTheme === t
                            ? "2px solid #fff"
                            : "2px solid transparent",
                        background: themes[t].primary,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: isDarkMode ? "#21253a" : "#f3f4f6",
                  padding: "12px",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "13px" }}>Sound Effects [M]</span>
                <button
                  onClick={toggleSound}
                  style={{
                    padding: "6px 12px",
                    background: isMuted ? "#ef4444" : "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {isMuted ? "MUTED 🔇" : "ENABLED 🔊"}
                </button>
              </div>
            </div>

            <button
              className="play-button"
              style={{ width: "100%", background: theme.primary }}
              onClick={() => setShowSettingsModal(false)}
            >
              Save & Close
            </button>
          </div>
        </div>
      )}

      {/* DAILY BONUS MODAL */}
      {showBonusModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              background: modeStyles.cardBg,
              color: modeStyles.textColor,
              borderColor: `${theme.primary}88`,
            }}
          >
            <div style={{ fontSize: "45px", marginBottom: "5px" }}>🎁</div>
            <h2 style={{ color: modeStyles.textColor }}>Daily Login Bonus!</h2>
            <p
              style={{
                color: modeStyles.subText,
                fontSize: "13px",
                margin: "15px 0",
              }}
            >
              Welcome back commander! Claim your daily reward of{" "}
              <strong style={{ color: theme.primary }}>+150 Points & XP</strong>{" "}
              right now!
            </p>
            <button
              className="play-button"
              style={{
                width: "100%",
                background: `linear-gradient(100deg, ${theme.primary}, ${theme.secondary})`,
              }}
              onClick={claimDailyBonus}
            >
              Claim Bonus 🎉
            </button>
          </div>
        </div>
      )}

      {/* RULES MODAL */}
      {showRulesModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              background: modeStyles.cardBg,
              color: modeStyles.textColor,
            }}
          >
            <button
              className="close-button"
              onClick={() => setShowRulesModal(null)}
              style={{ color: modeStyles.textColor }}
            >
              ✕
            </button>
            <div style={{ fontSize: "35px", marginBottom: "5px" }}>
              {showRulesModal.icon}
            </div>
            <h2 style={{ color: modeStyles.textColor }}>
              {showRulesModal.name} Rules
            </h2>
            <p
              style={{
                color: modeStyles.subText,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "15px 0",
              }}
            >
              {showRulesModal.rules}
            </p>
            <button
              className="play-button"
              style={{ width: "100%", background: theme.primary }}
              onClick={() => setShowRulesModal(null)}
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD MODAL */}
      {showLeaderboardModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              background: modeStyles.cardBg,
              color: modeStyles.textColor,
            }}
          >
            <button
              className="close-button"
              onClick={() => setShowLeaderboardModal(false)}
              style={{ color: modeStyles.textColor }}
            >
              ✕
            </button>
            <div style={{ fontSize: "35px", marginBottom: "5px" }}>🏆</div>
            <h2 style={{ color: modeStyles.textColor }}>Leaderboard</h2>
            <p
              style={{
                color: modeStyles.subText,
                fontSize: "13px",
                marginBottom: "15px",
              }}
            >
              Top Global Players
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                textAlign: "left",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: isDarkMode ? "#21253a" : "#f3f4f6",
                  padding: "10px 14px",
                  borderRadius: "8px",
                }}
              >
                <span>🥇 1. ShadowKnight</span>
                <span style={{ color: theme.primary, fontWeight: "bold" }}>
                  1,450 pts
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: isDarkMode ? "#21253a" : "#f3f4f6",
                  padding: "10px 14px",
                  borderRadius: "8px",
                }}
              >
                <span>🥈 2. CyberQueen</span>
                <span style={{ color: theme.primary, fontWeight: "bold" }}>
                  1,120 pts
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: isDarkMode ? "#21253a" : "#f3f4f6",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.primary}`,
                }}
              >
                <span>🥉 3. {currentUser} (You)</span>
                <span style={{ color: theme.primary, fontWeight: "bold" }}>
                  {totalPoints} pts
                </span>
              </div>
            </div>

            <button
              className="play-button"
              style={{ width: "100%", background: theme.primary }}
              onClick={() => setShowLeaderboardModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              background: modeStyles.cardBg,
              color: modeStyles.textColor,
            }}
          >
            <button
              className="close-button"
              onClick={() => setShowProfileModal(false)}
              style={{ color: modeStyles.textColor }}
            >
              ✕
            </button>
            <div
              style={{
                width: "65px",
                height: "65px",
                background: isDarkMode ? "#28213f" : "#e5e7eb",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: "32px",
                margin: "0 auto 10px",
                border: `2px solid ${theme.primary}`,
              }}
            >
              🎮
            </div>
            <h2 style={{ color: modeStyles.textColor }}>{currentUser}</h2>
            <p
              style={{
                color: theme.primary,
                fontSize: "12px",
                marginBottom: "15px",
              }}
            >
              Level 01 Pro Champion
            </p>

            <div
              style={{
                background: isDarkMode ? "#21253a" : "#f3f4f6",
                padding: "15px",
                borderRadius: "10px",
                textAlign: "left",
                marginBottom: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: modeStyles.subText }}>Total Wins:</span>{" "}
                <strong style={{ color: "#10b981" }}>{totalWins}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: modeStyles.subText }}>Total Losses:</span>{" "}
                <strong style={{ color: "#ef4444" }}>{totalLosses}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: modeStyles.subText }}>Total Points:</span>{" "}
                <strong style={{ color: theme.primary }}>
                  {totalPoints} pts
                </strong>
              </div>
            </div>

            <div
              style={{
                background: isDarkMode ? "#21253a" : "#f3f4f6",
                padding: "12px",
                borderRadius: "10px",
                textAlign: "left",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: modeStyles.subText,
                  marginBottom: "6px",
                }}
              >
                UNLOCKED BADGES ({badges.length})
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {badges.length > 0 ? (
                  badges.map((b, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: `${theme.primary}33`,
                        color: theme.primary,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        border: `1px solid ${theme.primary}55`,
                      }}
                    >
                      {b}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: modeStyles.subText }}>
                    Play games to unlock badges!
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="play-button"
                style={{ flex: 1, background: "#ef4444", marginTop: 0 }}
                onClick={handleLogout}
              >
                Logout 🚪
              </button>
              <button
                className="play-button"
                style={{ flex: 1, background: theme.primary, marginTop: 0 }}
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

{
  /* ================= ALL 7 MINI GAMES ================= */
}

function TicTacToe({ onWin, onLoss, primaryColor }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [hasEnded, setHasEnded] = useState(false);
  const [difficulty, setDifficulty] = useState("easy"); // 'easy' or 'hard'

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);

  if (winner && !hasEnded) {
    setHasEnded(true);
    if (winner === "X") onWin();
    else onLoss();
  }

  const findBestMove = (squares) => {
    // Basic unbeatable AI logic for Hard mode
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    // Check if AI can win or block player
    for (let char of ["O", "X"]) {
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        let lineVals = [squares[a], squares[b], squares[c]];
        if (
          lineVals.filter((v) => v === char).length === 2 &&
          lineVals.includes(null)
        ) {
          return [a, b, c][lineVals.indexOf(null)];
        }
      }
    }
    const emptyIndices = squares
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);
    if (emptyIndices.length === 0) return null;
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  const handleClick = (i) => {
    playSound("click");
    if (board[i] || winner || hasEnded) return;
    const newBoard = board.slice();
    newBoard[i] = "X";
    setBoard(newBoard);

    const emptyIndices = newBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);
    if (emptyIndices.length > 0 && !calculateWinner(newBoard)) {
      const aiIndex =
        difficulty === "hard"
          ? findBestMove(newBoard)
          : emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      if (aiIndex !== null) {
        newBoard[aiIndex] = "O";
        setBoard(newBoard);
        const aiWinner = calculateWinner(newBoard);
        if (aiWinner === "O" && !hasEnded) {
          setHasEnded(true);
          onLoss();
        }
      }
    }
  };

  const resetGame = () => {
    playSound("click");
    setBoard(Array(9).fill(null));
    setHasEnded(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <button
          onClick={() => setDifficulty("easy")}
          style={{
            padding: "4px 8px",
            background: difficulty === "easy" ? primaryColor : "#25283a",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          Easy AI
        </button>
        <button
          onClick={() => setDifficulty("hard")}
          style={{
            padding: "4px 8px",
            background: difficulty === "hard" ? primaryColor : "#25283a",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          Hard AI 🔥
        </button>
      </div>

      <p style={{ margin: "4px 0", color: primaryColor, fontSize: "13px" }}>
        {winner
          ? `Winner: ${winner} 🎉`
          : board.every(Boolean)
            ? "It's a Draw!"
            : `Your turn (X) [${difficulty.toUpperCase()}]`}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 65px)",
          gap: "6px",
          justifyContent: "center",
          margin: "10px 0",
        }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: "65px",
              height: "65px",
              fontSize: "22px",
              fontWeight: "bold",
              background: "#222639",
              color: cell === "X" ? primaryColor : "#ec4899",
              border: "1px solid #41335e",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {cell}
          </button>
        ))}
      </div>
      <button
        onClick={resetGame}
        style={{
          padding: "6px 12px",
          background: primaryColor,
          border: "none",
          color: "#fff",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Reset Game
      </button>
    </div>
  );
}

function RockPaperScissors({ onWin, onLoss, primaryColor }) {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState("Choose your move!");

  const choices = [
    { name: "Rock", icon: "✊" },
    { name: "Paper", icon: "✋" },
    { name: "Scissors", icon: "✌️" },
  ];

  const playGame = (choice) => {
    playSound("click");
    setPlayerChoice(choice.icon);
    const compChoice = choices[Math.floor(Math.random() * choices.length)];
    setComputerChoice(compChoice.icon);

    if (choice.name === compChoice.name) {
      setResult("It's a Tie! 🤝");
    } else if (
      (choice.name === "Rock" && compChoice.name === "Scissors") ||
      (choice.name === "Paper" && compChoice.name === "Rock") ||
      (choice.name === "Scissors" && compChoice.name === "Paper")
    ) {
      setResult("You Win! 🎉");
      onWin();
    } else {
      setResult("Computer Wins! 🤖");
      onLoss();
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: "8px 0", fontSize: "14px", color: primaryColor }}>
        {result}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          margin: "12px 0",
        }}
      >
        <div>
          <p style={{ fontSize: "11px", color: "#8c91a8" }}>You</p>
          <div
            style={{
              fontSize: "30px",
              background: "#222639",
              padding: "8px",
              borderRadius: "8px",
              minWidth: "45px",
            }}
          >
            {playerChoice || "❓"}
          </div>
        </div>
        <div style={{ alignSelf: "center", fontSize: "16px" }}>VS</div>
        <div>
          <p style={{ fontSize: "11px", color: "#8c91a8" }}>Computer</p>
          <div
            style={{
              fontSize: "30px",
              background: "#222639",
              padding: "8px",
              borderRadius: "8px",
              minWidth: "45px",
            }}
          >
            {computerChoice || "❓"}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        {choices.map((c) => (
          <button
            key={c.name}
            onClick={() => playGame(c)}
            style={{
              padding: "8px 12px",
              background: "#28213f",
              border: "1px solid #41335e",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {c.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function MemoryMatch({ onWin, primaryColor }) {
  const emojis = ["🍎", "🍌", "🍇", "🍓"];
  const [cards, setCards] = useState(() =>
    [...emojis, ...emojis].sort(() => Math.random() - 0.5),
  );
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [hasTriggeredWin, setHasTriggeredWin] = useState(false);

  const handleCardClick = (index) => {
    playSound("click");
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex] === cards[secondIndex]) {
        const newMatched = [...matched, firstIndex, secondIndex];
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.length === cards.length && !hasTriggeredWin) {
          setHasTriggeredWin(true);
          onWin();
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const resetMemory = () => {
    playSound("click");
    setCards([...emojis, ...emojis].sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
    setHasTriggeredWin(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: "8px 0", color: primaryColor, fontSize: "13px" }}>
        {matched.length === cards.length
          ? "You Matched All! 🎉"
          : "Match the pairs!"}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 50px)",
          gap: "6px",
          justifyContent: "center",
          margin: "10px 0",
        }}
      >
        {cards.map((emoji, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              style={{
                width: "50px",
                height: "50px",
                fontSize: "20px",
                background: isFlipped ? "#28213f" : "#171a2b",
                border: "1px solid #41335e",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {isFlipped ? emoji : "❓"}
            </button>
          );
        })}
      </div>
      <button
        onClick={resetMemory}
        style={{
          padding: "6px 12px",
          background: primaryColor,
          border: "none",
          color: "#fff",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Restart
      </button>
    </div>
  );
}

function NumberGuess({ onWin, primaryColor }) {
  const [targetNumber, setTargetNumber] = useState(
    () => Math.floor(Math.random() * 10) + 1,
  );
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("Guess a number (1 - 10)");
  const [won, setWon] = useState(false);

  const handleGuess = (e) => {
    e.preventDefault();
    playSound("click");
    const num = parseInt(guess);
    if (isNaN(num)) return;

    if (num === targetNumber) {
      setMessage("Correct! You guessed it! 🎯");
      setWon(true);
      onWin();
    } else if (num < targetNumber) {
      setMessage("Too low! Try higher.");
    } else {
      setMessage("Too high! Try lower.");
    }
    setGuess("");
  };

  const resetGuess = () => {
    playSound("click");
    setTargetNumber(Math.floor(Math.random() * 10) + 1);
    setMessage("Guess a number (1 - 10)");
    setWon(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: "8px 0", color: primaryColor, fontSize: "13px" }}>
        {message}
      </p>
      {!won ? (
        <form
          onSubmit={handleGuess}
          style={{
            display: "flex",
            gap: "6px",
            justifyContent: "center",
            margin: "10px 0",
          }}
        >
          <input
            type="number"
            min="1"
            max="10"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="1-10"
            style={{
              width: "90px",
              padding: "6px",
              background: "#151827",
              border: "1px solid #303348",
              borderRadius: "6px",
              color: "#fff",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "6px 10px",
              background: primaryColor,
              border: "none",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Guess
          </button>
        </form>
      ) : (
        <button
          onClick={resetGuess}
          style={{
            padding: "6px 12px",
            background: primaryColor,
            border: "none",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            margin: "10px 0",
          }}
        >
          Play Again
        </button>
      )}
    </div>
  );
}

function SnakeGame({ onWin, primaryColor }) {
  const [snake, setSnake] = useState([
    [5, 5],
    [5, 4],
  ]);
  const [food, setFood] = useState([7, 7]);
  const [dir, setDir] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = [...prevSnake[0]];
        if (dir === "RIGHT") head[1] += 1;
        if (dir === "LEFT") head[1] -= 1;
        if (dir === "UP") head[0] -= 1;
        if (dir === "DOWN") head[0] += 1;

        if (head[0] < 0 || head[0] >= 10 || head[1] < 0 || head[1] >= 10) {
          setGameOver(true);
          return prevSnake;
        }

        for (let segment of prevSnake) {
          if (segment[0] === head[0] && segment[1] === head[1]) {
            setGameOver(true);
            return prevSnake;
          }
        }

        const newSnake = [head, ...prevSnake];
        if (head[0] === food[0] && head[1] === food[1]) {
          setScore((s) => {
            const newS = s + 10;
            if (newS >= 40) onWin();
            return newS;
          });
          setFood([
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10),
          ]);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [dir, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" && dir !== "DOWN") setDir("UP");
      if (e.key === "ArrowDown" && dir !== "UP") setDir("DOWN");
      if (e.key === "ArrowLeft" && dir !== "RIGHT") setDir("LEFT");
      if (e.key === "ArrowRight" && dir !== "LEFT") setDir("RIGHT");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dir]);

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: "4px 0", color: primaryColor, fontSize: "13px" }}>
        Score: {score} / 40 (Use Arrow Keys)
      </p>
      <div
        style={{
          width: "200px",
          height: "200px",
          background: "#111320",
          margin: "10px auto",
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gridTemplateRows: "repeat(10, 1fr)",
          border: `1px solid ${primaryColor}`,
        }}
      >
        {Array.from({ length: 10 }).map((_, r) =>
          Array.from({ length: 10 }).map((_, c) => {
            const isSnake = snake.some((s) => s[0] === r && s[1] === c);
            const isFood = food[0] === r && food[1] === c;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  background: isSnake
                    ? primaryColor
                    : isFood
                      ? "#10b981"
                      : "transparent",
                  borderRadius: isFood ? "50%" : "2px",
                }}
              />
            );
          }),
        )}
      </div>
      {gameOver && (
        <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0" }}>
          Game Over!
        </p>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "6px",
          marginTop: "8px",
        }}
      >
        <button
          onClick={() => setDir("UP")}
          style={{
            padding: "4px 8px",
            background: "#25283a",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          ⬆️
        </button>
        <button
          onClick={() => setDir("DOWN")}
          style={{
            padding: "4px 8px",
            background: "#25283a",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          ⬇️
        </button>
        <button
          onClick={() => setDir("LEFT")}
          style={{
            padding: "4px 8px",
            background: "#25283a",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          ⬅️
        </button>
        <button
          onClick={() => setDir("RIGHT")}
          style={{
            padding: "4px 8px",
            background: "#25283a",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          ➡️
        </button>
      </div>
    </div>
  );
}

function QuizChallenge({ onWin, primaryColor }) {
  const questions = [
    {
      q: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Multi Language",
        "Home Tool Markup Language",
      ],
      ans: 0,
    },
    {
      q: "Which library is used for building UIs in React?",
      options: ["Angular", "React", "Vue"],
      ans: 1,
    },
    {
      q: "Which hook is used for side effects in React?",
      options: ["useState", "useEffect", "useMemo"],
      ans: 1,
    },
  ];
  const [currQ, setCurrQ] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx) => {
    playSound("click");
    if (idx === questions[currQ].ans) {
      setScore((s) => s + 1);
    }
    if (currQ + 1 < questions.length) {
      setCurrQ((c) => c + 1);
    } else {
      setFinished(true);
      onWin();
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      {!finished ? (
        <div>
          <p
            style={{
              color: primaryColor,
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Question {currQ + 1} of {questions.length}
          </p>
          <p style={{ fontSize: "14px", fontWeight: "bold", margin: "10px 0" }}>
            {questions[currQ].q}
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "12px",
            }}
          >
            {questions[currQ].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                style={{
                  padding: "8px 12px",
                  background: "#222639",
                  color: "#fff",
                  border: `1px solid ${primaryColor}44`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: primaryColor,
              marginBottom: "8px",
            }}
          >
            Quiz Completed! 🎉
          </p>
          <p style={{ fontSize: "13px", color: "#b6b8cc" }}>
            Your Score: {score} / {questions.length}
          </p>
        </div>
      )}
    </div>
  );
}

function ReactionTimer({ onWin, primaryColor }) {
  const [gameState, setGameState] = useState("waiting");
  const [startTime, setStartTime] = useState(null);
  const [message, setMessage] = useState("Click 'Start' to test your reflex!");

  const startGame = () => {
    playSound("click");
    setGameState("ready");
    setMessage("Wait for green...");
    const randomTime = Math.random() * 2000 + 1500;
    setTimeout(() => {
      setGameState((current) => {
        if (current === "ready") {
          setStartTime(Date.now());
          return "click";
        }
        return current;
      });
    }, randomTime);
  };

  const handleClickBox = () => {
    if (gameState === "ready") {
      setGameState("waiting");
      setMessage("Too soon! Click Start to try again.");
    } else if (gameState === "click") {
      const timeTaken = Date.now() - startTime;
      setGameState("result");
      setMessage(`Your Time: ${timeTaken} ms ⚡`);
      if (timeTaken < 450) {
        onWin();
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: "8px 0", color: primaryColor, fontSize: "13px" }}>
        {message}
      </p>

      {gameState === "waiting" || gameState === "result" ? (
        <button
          onClick={startGame}
          style={{
            padding: "10px 20px",
            background: primaryColor,
            border: "none",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            margin: "15px 0",
          }}
        >
          {gameState === "result" ? "Try Again" : "Start Test ⚡"}
        </button>
      ) : (
        <div
          onClick={handleClickBox}
          style={{
            width: "100%",
            height: "120px",
            background: gameState === "ready" ? "#ef4444" : "#10b981",
            borderRadius: "10px",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            margin: "15px 0",
          }}
        >
          {gameState === "ready" ? "Wait for Green..." : "CLICK NOW! 🚀"}
        </div>
      )}
    </div>
  );
}

export default App;
