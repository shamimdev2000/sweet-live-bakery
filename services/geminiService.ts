
import { GoogleGenAI } from "@google/genai";
import { Product, Sale, Expense } from "../types";

export const getBusinessInsights = async (
  products: Product[],
  sales: Sale[],
  expenses: Expense[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const totalSales = sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const profit = totalSales - totalExpenses;
  
  const prompt = `
    As a professional bakery business consultant, analyze the following data for my bakery called "Sweet Live Bakery".
    
    Data Summary:
    - Total Products: ${products.length}
    - Total Sales Revenue: ৳${totalSales}
    - Total Expenses: ৳${totalExpenses}
    - Net Profit/Loss: ৳${profit}
    
    Products: ${JSON.stringify(products)}
    Recent Sales History: ${JSON.stringify(sales.slice(-10))}
    Recent Expenses: ${JSON.stringify(expenses.slice(-10))}
    
    Please provide:
    1. A summary of current performance.
    2. Top 3 recommendations to increase profit.
    3. Warning if expenses are too high or stock is low.
    4. A prediction for the next month.
    
    Answer in a friendly tone. Use Bengali for the advice if possible, as the user is a Bengali speaker, but use English for technical terms.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Could not generate insights at this time. Please check your data or try again later.";
  }
};
