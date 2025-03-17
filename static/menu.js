document.addEventListener("DOMContentLoaded", () => {
    const startGameButton = document.getElementById("start-game");
    const viewLeaderboardButton = document.getElementById("view-leaderboard");
    const profileButton = document.getElementById("profile");

    startGameButton.addEventListener("click", () => {
        window.location.href = "/game";
    });

    viewLeaderboardButton.addEventListener("click", () => {
        // Fetch and display leaderboard
    });

    profileButton.addEventListener("click", () => {
        // Open profile settings
    });
});