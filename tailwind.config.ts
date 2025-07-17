
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				music: {
					midnight: 'hsl(var(--music-midnight))',
					'deep-purple': 'hsl(var(--music-deep-purple))',
					'royal-blue': 'hsl(var(--music-royal-blue))',
					emerald: 'hsl(var(--music-emerald))',
					platinum: 'hsl(var(--music-platinum))',
					copper: 'hsl(var(--music-copper))',
					crimson: 'hsl(var(--music-crimson))',
					indigo: 'hsl(var(--music-indigo))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					from: {
						opacity: '0'
					},
					to: {
						opacity: '1'
					}
				},
				slideIn: {
					from: {
						transform: 'translateX(-10px)',
						opacity: '0'
					},
					to: {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'vinyl-spin': {
					to: {
						transform: 'rotate(360deg)'
					}
				},
				'beat-pulse': {
					'0%, 100%': {
						transform: 'scale(1)',
						boxShadow: '0 0 0 0 hsl(var(--primary) / 0.7)'
					},
					'50%': {
						transform: 'scale(1.05)',
						boxShadow: '0 0 0 10px hsl(var(--primary) / 0)'
					}
				},
				'gradient-shift': {
					'0%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					},
					'100%': {
						backgroundPosition: '0% 50%'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'slide-in': 'slideIn 0.3s ease-in-out',
				'vinyl-spin': 'vinyl-spin 20s linear infinite',
				'beat-pulse': 'beat-pulse 2s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Poppins', 'sans-serif'],
			},
			backgroundImage: {
				'music-gradient': 'linear-gradient(135deg, hsl(139 92 246), hsl(99 102 241), hsl(79 70 229))',
				'dark-gradient': 'linear-gradient(135deg, hsl(10 9 18), hsl(var(--background)))',
				'royal-gradient': 'linear-gradient(135deg, hsl(37 99 235), hsl(79 70 229))',
				'emerald-gradient': 'linear-gradient(135deg, hsl(16 185 129), hsl(99 102 241))',
				'crimson-gradient': 'linear-gradient(135deg, hsl(220 38 127), hsl(139 92 246))',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
