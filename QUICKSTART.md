# 🚀 Quick Start Guide

## Super Fast Setup (5 minutes)

### Option 1: Automatic Start (Easiest!)

```bash
./start.sh
```

That's it! Both servers will start automatically! 🎉

### Option 2: Manual Start

#### Terminal 1 - Backend:
```bash
cd backend
source ../venv/bin/activate
python main.py
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 🌐 Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎯 Quick Test

1. Open http://localhost:5173 in your browser
2. Click on "Speech vs Typing" experiment
3. Allow microphone access when prompted
4. Follow the on-screen instructions
5. Enjoy! 🎤✨

## 🐛 Troubleshooting

### "Command not found: python"
Use `python3` instead:
```bash
python3 main.py
```

### Microphone not working
- Check browser permissions (chrome://settings/content/microphone)
- Allow microphone access for localhost
- Refresh the page

### Port already in use
Kill existing processes:
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

### Backend dependencies missing
```bash
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
```

## 📱 Test Each Experiment

### ⚡ Speech vs Typing
1. Type the sentence
2. Then speak it
3. Compare results!

### 🌍 Accent Effect
1. Select an accent
2. Record with that accent
3. See accuracy results

### 🔊 Background Noise
1. Play music/noise
2. Record while noise plays
3. Check impact on accuracy

### 🌐 Multilingual
1. Choose a language
2. Enter phrase in that language
3. Record and test!

## 🎨 Features to Try

- ✨ Hover over experiment cards for glow effects
- 🎵 Watch the audio visualizer while recording
- 📊 See animated accuracy bars in results
- 🌈 Enjoy the floating background orbs

## ⚡ Pro Tips

1. **Speak clearly** for best results
2. **Use Chrome/Edge** for better audio support
3. **Quiet environment** = better accuracy
4. **Try different languages** to see multilingual support
5. **Test with friends** with different accents!

---

**Need help?** Check the full README.md for detailed documentation!

Enjoy your Speech Recognition experiments! 🎤💜

