import { vi } from 'vitest'

// Mock Quasar components globally
vi.mock('quasar', () => {
    return {
        QCard: vi.fn(),
        QCardSection: vi.fn(),
        QInput: vi.fn(),
        QBtn: vi.fn(),
        QMenu: vi.fn(),
        QList: vi.fn(),
        QItem: vi.fn(),
        QItemSection: vi.fn(),
        QTable: vi.fn(),
        QTr: vi.fn(),
        QTd: vi.fn(),
        QTh: vi.fn(),
        QChip: vi.fn(),
        QImg: vi.fn(),
        useQuasar: vi.fn(() => ({ 
            notify: vi.fn()
        }))
    }
})

// Add any additional global test setup here