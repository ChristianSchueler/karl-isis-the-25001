import { Gpio } from 'onoff';

const led = new Gpio(7, 'out');
const button = new Gpio(5, 'in', 'both');

button.watch((err, value) => {
    if (err) {
      throw err;
    }
  
    led.writeSync(value);
  });
  
  process.on('SIGINT', _ => {
    led.unexport();
    button.unexport();
  });