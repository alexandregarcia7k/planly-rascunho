import React, { useState } from 'react';
import { Calculator, DollarSign, Heart, Thermometer, Weight, Ruler } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BasicCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const buttonClass = "h-12 text-lg font-medium";
  const operatorClass = "h-12 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <div className="max-w-xs mx-auto">
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="text-right text-2xl font-mono break-words">{display}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={clear} className={buttonClass} variant="outline">C</Button>
          <Button onClick={() => performOperation('/')} className={operatorClass}>÷</Button>
          <Button onClick={() => performOperation('*')} className={operatorClass}>×</Button>
          <Button onClick={() => setDisplay(display.slice(0, -1) || '0')} className={buttonClass} variant="outline">←</Button>
          
          <Button onClick={() => inputNumber('7')} className={buttonClass} variant="outline">7</Button>
          <Button onClick={() => inputNumber('8')} className={buttonClass} variant="outline">8</Button>
          <Button onClick={() => inputNumber('9')} className={buttonClass} variant="outline">9</Button>
          <Button onClick={() => performOperation('-')} className={operatorClass}>-</Button>
          
          <Button onClick={() => inputNumber('4')} className={buttonClass} variant="outline">4</Button>
          <Button onClick={() => inputNumber('5')} className={buttonClass} variant="outline">5</Button>
          <Button onClick={() => inputNumber('6')} className={buttonClass} variant="outline">6</Button>
          <Button onClick={() => performOperation('+')} className={operatorClass}>+</Button>
          
          <Button onClick={() => inputNumber('1')} className={buttonClass} variant="outline">1</Button>
          <Button onClick={() => inputNumber('2')} className={buttonClass} variant="outline">2</Button>
          <Button onClick={() => inputNumber('3')} className={buttonClass} variant="outline">3</Button>
          <Button onClick={handleEquals} className={`${operatorClass} row-span-2`}>=</Button>
          
          <Button onClick={() => inputNumber('0')} className={`${buttonClass} col-span-2`} variant="outline">0</Button>
          <Button onClick={inputDot} className={buttonClass} variant="outline">.</Button>
        </div>
      </div>
    </div>
  );
};

const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<{ bmi: number; category: string } | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // Convert cm to m
    const w = parseFloat(weight);
    
    if (h > 0 && w > 0) {
      const bmi = w / (h * h);
      let category = '';
      
      if (bmi < 18.5) category = 'Abaixo do peso';
      else if (bmi < 25) category = 'Peso normal';
      else if (bmi < 30) category = 'Sobrepeso';
      else category = 'Obesidade';
      
      setResult({ bmi: Math.round(bmi * 10) / 10, category });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Ex: 175"
          />
        </div>
        <div>
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 70"
          />
        </div>
        <Button onClick={calculateBMI} className="w-full">
          Calcular IMC
        </Button>
      </div>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Resultado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{result.bmi}</div>
            <div className="text-lg text-muted-foreground">{result.category}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BRL');
  const [result, setResult] = useState<number | null>(null);

  // Mock exchange rates - in a real app, you'd fetch from an API
  const exchangeRates: { [key: string]: number } = {
    'USD-BRL': 5.2,
    'EUR-BRL': 5.8,
    'BRL-USD': 0.19,
    'BRL-EUR': 0.17,
    'USD-EUR': 0.9,
    'EUR-USD': 1.1
  };

  const convert = () => {
    const value = parseFloat(amount);
    if (value > 0) {
      const rate = exchangeRates[`${fromCurrency}-${toCurrency}`] || 1;
      setResult(value * rate);
    }
  };

  const currencies = [
    { value: 'BRL', label: 'Real (BRL)' },
    { value: 'USD', label: 'Dólar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ];

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Digite o valor"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>De</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Para</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={convert} className="w-full">
          Converter
        </Button>
      </div>
      
      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {result.toFixed(2)} {toCurrency}
              </div>
              <div className="text-sm text-muted-foreground">
                {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const UnitConverter = () => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [result, setResult] = useState<number | null>(null);

  const conversions: { [key: string]: number } = {
    // Length (to meters)
    'mm': 0.001,
    'cm': 0.01,
    'm': 1,
    'km': 1000,
    'in': 0.0254,
    'ft': 0.3048,
    
    // Weight (to grams)
    'mg': 0.001,
    'g': 1,
    'kg': 1000,
    'oz': 28.35,
    'lb': 453.59
  };

  const units = [
    { value: 'mm', label: 'Milímetros (mm)', category: 'length' },
    { value: 'cm', label: 'Centímetros (cm)', category: 'length' },
    { value: 'm', label: 'Metros (m)', category: 'length' },
    { value: 'km', label: 'Quilômetros (km)', category: 'length' },
    { value: 'in', label: 'Polegadas (in)', category: 'length' },
    { value: 'ft', label: 'Pés (ft)', category: 'length' },
    { value: 'mg', label: 'Miligramas (mg)', category: 'weight' },
    { value: 'g', label: 'Gramas (g)', category: 'weight' },
    { value: 'kg', label: 'Quilogramas (kg)', category: 'weight' },
    { value: 'oz', label: 'Onças (oz)', category: 'weight' },
    { value: 'lb', label: 'Libras (lb)', category: 'weight' }
  ];

  const convert = () => {
    const inputValue = parseFloat(value);
    if (inputValue >= 0) {
      const fromBase = conversions[fromUnit];
      const toBase = conversions[toUnit];
      
      if (fromBase && toBase) {
        const baseValue = inputValue * fromBase;
        const convertedValue = baseValue / toBase;
        setResult(convertedValue);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="value">Valor</Label>
          <Input
            id="value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Digite o valor"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>De</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map(unit => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Para</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {units.map(unit => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={convert} className="w-full">
          Converter
        </Button>
      </div>
      
      {result !== null && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {result.toFixed(6)} {toUnit}
              </div>
              <div className="text-sm text-muted-foreground">
                {value} {fromUnit} = {result.toFixed(6)} {toUnit}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default function Calculators() {
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Calculadoras e Conversores</h1>
          <p className="text-muted-foreground">
            Ferramentas úteis para cálculos do dia a dia
          </p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Calculator size={16} />
              <span className="hidden sm:inline">Básica</span>
            </TabsTrigger>
            <TabsTrigger value="bmi" className="flex items-center gap-2">
              <Heart size={16} />
              <span className="hidden sm:inline">IMC</span>
            </TabsTrigger>
            <TabsTrigger value="currency" className="flex items-center gap-2">
              <DollarSign size={16} />
              <span className="hidden sm:inline">Moedas</span>
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center gap-2">
              <Ruler size={16} />
              <span className="hidden sm:inline">Unidades</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator size={20} />
                    Calculadora Básica
                  </CardTitle>
                  <CardDescription>
                    Calculadora simples para operações matemáticas básicas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BasicCalculator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bmi">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart size={20} />
                    Calculadora de IMC
                  </CardTitle>
                  <CardDescription>
                    Calcule seu Índice de Massa Corporal e veja sua categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BMICalculator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="currency">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={20} />
                    Conversor de Moedas
                  </CardTitle>
                  <CardDescription>
                    Converta entre diferentes moedas com taxas atualizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CurrencyConverter />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="units">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler size={20} />
                    Conversor de Unidades
                  </CardTitle>
                  <CardDescription>
                    Converta entre diferentes unidades de medida
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UnitConverter />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
