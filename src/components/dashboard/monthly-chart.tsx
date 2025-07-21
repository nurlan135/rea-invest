'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface MonthlyChartProps {
  data: Array<{
    month: string
    properties: number
    transactions: number
    revenue: number
    profit: number
  }>
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gəlir və Mənfəət Trendi */}
      <Card>
        <CardHeader>
          <CardTitle>Aylıq Gəlir və Mənfəət</CardTitle>
          <CardDescription>Son 12 ayın maliyyə göstəriciləri</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`₼${value.toLocaleString()}`, '']}
                labelFormatter={(label: any) => `Ay: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Gəlir"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#16a34a" 
                strokeWidth={2}
                name="Mənfəət"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Əmlak və Əməliyyat Sayları */}
      <Card>
        <CardHeader>
          <CardTitle>Əmlak və Əməliyyatlar</CardTitle>
          <CardDescription>Aylıq fəaliyyət göstəriciləri</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="properties" fill="#8884d8" name="Əmlaklar" />
              <Bar dataKey="transactions" fill="#82ca9d" name="Əməliyyatlar" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}