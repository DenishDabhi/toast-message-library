const light = {
  name: 'light',
  colors: {
    success: {
      background: '#ECFDF3',
      text: '#05603A',
      border: '#ABEFC6',
      icon: '#079455',
      iconText: '#FFFFFF',
    },
    error: {
      background: '#FEF3F2',
      text: '#912018',
      border: '#FECDCA',
      icon: '#D92D20',
      iconText: '#FFFFFF',
    },
    warning: {
      background: '#FFFAEB',
      text: '#93370D',
      border: '#FEDF89',
      icon: '#B54708',
      iconText: '#FFFFFF',
    },
    info: {
      background: '#EFF8FF',
      text: '#175CD3',
      border: '#B2DDFF',
      icon: '#1570EF',
      iconText: '#FFFFFF',
    },
    custom: {
      background: '#FFFFFF',
      text: '#101828',
      border: '#E4E7EC',
      icon: '#475467',
      iconText: '#FFFFFF',
    },
  },
  actionColor: undefined,
  closeColor: undefined,
  progressTrack: 'rgba(0,0,0,0.08)',
  borderRadius: 14,
  borderWidth: 1,
  padding: 14,
  spacing: 10,
  iconSize: 24,
  typography: {
    titleSize: 15,
    titleWeight: '700',
    messageSize: 14,
    messageWeight: '400',
    fontFamily: undefined,
  },
  shadow: {
    color: '#101828',
    opacity: 0.14,
    radius: 12,
    offsetY: 4,
    elevation: 6,
  },
};

export default light;
