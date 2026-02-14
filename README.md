# ⚽ Kids Penalty Shootout Game

A fun, browser-based penalty shootout game built for kids! Two players compete in an exciting soccer penalty challenge with cartoon characters, smooth animations, and responsive controls.

## 🎮 Features

- **Two-Player Local Multiplayer** - Goalkeeper vs Shooter
- **Customizable Characters** - Pick your jersey colors
- **Multiple Control Options** - Keyboard, Mouse, and Touch support
- **Mobile Responsive** - Play on any device
- **Smooth Animations** - Goalkeeper dives, ball physics, celebrations
- **Best-of-5 Format** - With sudden death tiebreaker
- **Kid-Friendly Design** - Simple, colorful, and fun!

## 🕹️ How to Play

### Goalkeeper Controls
- **Keyboard:** Use Arrow Keys (← →) to select position, press ENTER to confirm
- **Mouse/Touch:** Click or tap the LEFT, CENTER, or RIGHT buttons

### Shooter Controls
- **Mouse:** Move to aim, click to shoot
- **Touch:** Tap where you want to shoot
- **Keyboard:** Arrow keys to aim, ENTER to shoot

## 🚀 Deployment to GitHub Pages

Follow these simple steps to deploy your game:

### Step 1: Add Files to Your Repository

1. **Clone your repository** (if you haven't already):
   ```bash
   git clone https://github.com/narasimman-kb/kids-penalty-shootout.git
   cd kids-penalty-shootout
   ```

2. **Copy the game files** to your repository:
   - Copy `index.html`, `style.css`, `game.js`, and `README.md` to the root of your repo

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add penalty shootout game"
   git push origin main
   ```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/narasimman-kb/kids-penalty-shootout
2. Click on **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment

### Step 3: Access Your Game! 🎉

Your game will be live at:
```
https://narasimman-kb.github.io/kids-penalty-shootout/
```

Share this link with your kids and let them play!

## 🎨 Customization

### Change Colors
Edit the default colors in `index.html` (lines with `value="#FF6B6B"` and `value="#4ECDC4"`).

### Add Sound Effects
To add sound effects:
1. Add audio files (`.mp3` or `.ogg`) to your repository
2. Update the `playSound()` function in `game.js`:
   ```javascript
   function playSound(type) {
       const audio = new Audio(type === 'goal' ? 'goal.mp3' : 'save.mp3');
       audio.play();
   }
   ```

### Adjust Difficulty
In `game.js`, modify these values:
- `maxRounds: 5` - Change number of rounds
- Ball speed: Adjust `speed = 12` in the `shoot()` function

## 📱 Browser Compatibility

- ✅ Chrome, Firefox, Safari, Edge (latest versions)
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ✅ Tablets and desktop

## 🛠️ Technical Stack

- **Pure HTML5/CSS3/JavaScript** - No frameworks needed!
- **Canvas API** - For smooth game rendering
- **Responsive Design** - Works on all screen sizes
- **Touch Events** - Full mobile support

## 👨‍👩‍👧‍👦 For Parents

This game is designed to be:
- ✅ Safe for kids (no external content, no ads)
- ✅ Privacy-friendly (all data stored locally)
- ✅ Educational (improves hand-eye coordination)
- ✅ Fun for siblings to play together!

## 📝 License

Free to use and modify for personal use. Built with ❤️ for your kids!

---

**Enjoy the game! May the best player win! ⚽🏆**
