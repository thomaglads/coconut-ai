# 🥥 Coconut AI Beta Distribution Guide
*Complete Distribution Package for Real-World Testing*

## 📦 Available Executables

### Windows Distribution (Ready for Testing)

#### Primary Installer (Recommended)
- **File**: `Coconut AI Setup 1.0.0-beta.exe`
- **Size**: ~220 MB
- **Architecture**: Both x64 and ARM64 included
- **Type**: NSIS Installer with desktop shortcuts
- **Features**: Hybrid-RAG system, Logic Trace UI

#### Portable Version (No Installation Required)
- **File**: `Coconut AI Portable 1.0.0-beta.exe`  
- **Size**: ~220 MB
- **Architecture**: Both x64 and ARM64 included
- **Type**: Portable executable - can run from USB drive
- **Features**: Full offline capability, zero installation

## 🚀 Installation & Setup

### Method 1: Installer (Recommended for Most Users)
1. Download `InsightEngine Enterprise Setup 1.0.0.exe`
2. Right-click → "Run as Administrator"
3. Follow installation wizard
4. Launch from desktop shortcut or Start Menu

### Method 2: Portable (For USB/Testing)
1. Download `InsightEngine Enterprise 1.0.0.exe`
2. Create folder (e.g., `C:\CoconutAI`)
3. Place executable in folder
4. Double-click to run (no installation required)

### Method 3: Developer Version
1. Clone repository: `git clone -b coconut https://github.com/thomaglads/InsightEngine-Desktop.git`
2. Install dependencies: `npm install`
3. Run in development: `npm run electron:dev`

## 💾 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11 (x64 or ARM64)
- **RAM**: 4GB (8GB+ recommended for large datasets)
- **Storage**: 500MB free space
- **Display**: 1024x768 resolution

### Recommended Requirements
- **OS**: Windows 11
- **RAM**: 8GB+ (for optimal performance)
- **Storage**: 2GB free space
- **CPU**: Modern multi-core processor

## 🧪 Beta Testing Instructions

### First-Time Setup
1. **Launch Application**: Start Coconut AI
2. **Initialize Neural Engine**: Click "Initialize" button (loads embedded Llama 3.2 model)
3. **Load Test Data**: Use any CSV file or included test datasets
4. **Follow Beta Missions**: Use the Beta Review Kit

### Test Datasets (Included)
- `test_data/ecommerce_orders.csv` - Sales data
- `test_data/student_grades.csv` - Educational data  
- `test_data/inventory.csv` - Inventory tracking
- `test_data/weather.csv` - Time series data
- `test_data/employee_shifts.csv` - Workforce data

### Key Features to Test
1. **Hybrid-RAG Routing**: Click "Show Work" to see if requests go to Direct Math Engine vs SQL LLM
2. **Speed Performance**: Should be <1s for forecasts, <3s for complex queries
3. **Offline Capability**: Disconnect from network - app should work fully offline
4. **Data Privacy**: No data should leave the device

## 📋 Beta Testing Checklist

### Core Functionality Tests
- [ ] Load CSV files of various sizes
- [ ] Run basic queries (totals, counts, listings)
- [ ] Test forecasting/prediction requests
- [ ] Verify "Show Work" displays routing correctly
- [ ] Test with no internet connection
- [ ] Try large datasets (>10,000 rows)

### UI/UX Tests
- [ ] Interface is responsive and intuitive
- [ ] Charts render correctly and are readable
- [ ] Error messages are helpful and clear
- [ ] Performance remains smooth with large data

### Technical Tests
- [ ] Application starts without crashes
- [ ] Memory usage stays reasonable
- [ ] CPU usage doesn't spike excessively
- [ ] No error logs in console

### Documentation Tests
- [ ] User Welcome Guide is clear and helpful
- [ ] Review Log Template is easy to use
- [ ] Beta missions are understandable

## 🔧 Troubleshooting

### Common Issues
1. **"Model Not Found" Error**
   - Solution: Click "Initialize" button in the app
   - Alternative: Download model manually and place in models/ folder

2. **Application Won't Start**
   - Solution: Run as Administrator
   - Check Windows Defender isn't blocking

3. **Slow Performance**
   - Solution: Ensure sufficient RAM (8GB+ recommended)
   - Close other applications

4. **CSV Import Fails**
   - Solution: Ensure CSV has headers and valid format
   - Check file size (<100MB recommended)

## 📧 Feedback Collection

### How Testers Should Report Issues
1. **Use Review Log Template**: `docs/REVIEW_LOG_TEMPLATE.md`
2. **Screenshot Issues**: Include UI screenshots if possible
3. **System Info**: Include Windows version, RAM, CPU
4. **Data Samples**: Provide sample data that caused issues

### Feedback Channels
- **GitHub Issues**: Create issues in the repository
- **Direct Email**: [your-email@domain.com]
- **Review Log Files**: Collect and analyze structured feedback

## 🌍 Distribution Methods

### Direct Distribution
1. **Email Executables**: Send installer files directly to testers
2. **File Sharing**: Use Google Drive, Dropbox, or similar
3. **Network Share**: Place on internal network drive

### Self-Hosted Distribution
1. **Web Server**: Host executables on internal web server
2. **GitHub Releases**: Upload to GitHub releases page
3. **Package Manager**: Create internal npm/Chocolatey package

## 📊 Success Metrics

### Technical Metrics
- Installation success rate
- Application startup time
- Memory/CPU usage patterns
- Error frequency and types

### User Experience Metrics
- Task completion rates
- Time-to-insight metrics
- User satisfaction scores
- Feature adoption rates

### Beta Program Goals
- Validate Hybrid-RAG architecture performance
- Identify edge cases and bugs
- Gather feedback for v1.1 improvements
- Test offline-first value proposition

## 🔒 Security & Privacy Notes

### Built-in Protections
- 100% offline operation
- No telemetry or analytics
- Data never leaves device
- Local AI model only

### Testing Security
- Test with sensitive data (should remain secure)
- Verify no network requests are made
- Confirm local storage of data only

---

## 🎯 Next Steps After Beta

1. **Collect Feedback**: Aggregate Review Log responses
2. **Analyze Performance**: Identify bottlenecks and issues
3. **Prioritize Fixes**: Plan v1.1 improvements
4. **Production Release**: Create stable release build
5. **Scale Distribution**: Wider rollout strategy

**Coconut AI v1.0.0 - Beta Testing Ready!** 🥥