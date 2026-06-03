---
name: AgriMarket Class Diagram
overview: "A simple two-part class diagram for AgriMarket: (1) core domain entities from the database schema, and (2) high-level application layers. Both are provided in copy-paste-ready Mermaid and PlantUML formats for your docs file."
todos: []
isProject: false
---

# AgriMarket Simple Class Diagram

Use either **Mermaid** (works in Google Docs add-ons, Notion, GitHub, many thesis templates) or **PlantUML** (works in draw.io, Lucidchart, Word with PlantUML plugin).

---

## Diagram 1 — Domain Model (recommended for your docs)

This reflects the main entities in [`server/prisma/schema.prisma`](server/prisma/schema.prisma).

### Copy-paste: Mermaid

```mermaid
classDiagram
    direction TB

    class User {
        +String id
        +String name
        +String email
        +String password
        +UserRole role
        +ApprovalStatus approvalStatus
        +String phone
        +String region
        +String woreda
        +String farmSize
        +String crops
        +String experience
        +DateTime createdAt
    }

    class Product {
        +String id
        +String name
        +String description
        +Decimal price
        +ProductUnit unit
        +ProductCategory category
        +Int stock
        +Boolean isAvailable
        +String location
        +Float ratingsAverage
    }

    class Farm {
        +String id
        +String name
        +String size
        +String region
        +String woreda
        +String soilType
        +String soilColor
        +Float nitrogen
        +Float phosphorus
        +Float potassium
        +Float ph
        +Float temperature
        +Float humidity
        +Float rainfall
        +String[] crops
        +Boolean isActive
    }

    class Notification {
        +String id
        +String key
        +String type
        +String href
        +Int count
        +Boolean isRead
        +DateTime createdAt
    }

    class Chat {
        +String id
        +String title
        +Json messages
        +DateTime createdAt
    }

    class Price {
        +String id
        +String cropName
        +String region
        +Int year
        +Int month
        +Float avgPrice
        +Float minPrice
        +Float maxPrice
        +String source
    }

    class UserRole {
        <<enumeration>>
        TRADER
        FARMER
        ADMIN
    }

    class ApprovalStatus {
        <<enumeration>>
        PENDING
        APPROVED
        REJECTED
    }

    User "1" --> "0..*" Product : owns
    User "1" --> "0..*" Farm : owns
    User "1" --> "0..*" Notification : receives
    User "1" --> "0..*" Chat : has
    User --> UserRole : role
    User --> ApprovalStatus : approvalStatus
```

### Copy-paste: PlantUML

```plantuml
@startuml AgriMarket_Domain_Model

enum UserRole {
  TRADER
  FARMER
  ADMIN
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

class User {
  +id : String
  +name : String
  +email : String
  +password : String
  +role : UserRole
  +approvalStatus : ApprovalStatus
  +phone : String
  +region : String
  +woreda : String
  +farmSize : String
  +crops : String
  +experience : String
  +createdAt : DateTime
}

class Product {
  +id : String
  +name : String
  +description : String
  +price : Decimal
  +unit : ProductUnit
  +category : ProductCategory
  +stock : Int
  +isAvailable : Boolean
  +location : String
  +ratingsAverage : Float
}

class Farm {
  +id : String
  +name : String
  +size : String
  +region : String
  +woreda : String
  +soilType : String
  +soilColor : String
  +nitrogen : Float
  +phosphorus : Float
  +potassium : Float
  +ph : Float
  +temperature : Float
  +humidity : Float
  +rainfall : Float
  +crops : String[]
  +isActive : Boolean
}

class Notification {
  +id : String
  +key : String
  +type : String
  +href : String
  +count : Int
  +isRead : Boolean
  +createdAt : DateTime
}

class Chat {
  +id : String
  +title : String
  +messages : Json
  +createdAt : DateTime
}

class Price {
  +id : String
  +cropName : String
  +region : String
  +year : Int
  +month : Int
  +avgPrice : Float
  +minPrice : Float
  +maxPrice : Float
  +source : String
}

User "1" -- "0..*" Product : owns >
User "1" -- "0..*" Farm : owns >
User "1" -- "0..*" Notification : receives >
User "1" -- "0..*" Chat : has >

@enduml
```

---

## Diagram 2 — System Architecture (optional, simpler overview)

Shows how the three tiers connect. Based on [`server/src/index.js`](server/src/index.js) routes and [`agriAI/api/main.py`](agriAI/api/main.py).

### Copy-paste: Mermaid

```mermaid
classDiagram
    direction LR

    class WebClient {
        +Next.js pages
        +React components
        +api.ts client
    }

    class MobileClient {
        +Flutter screens
        +ApiService
        +Domain models
    }

    class ExpressAPI {
        +AuthController
        +UserController
        +ProductController
        +FarmController
        +PriceController
        +ChatController
        +NotificationController
        +AgriAIController
    }

    class ServiceLayer {
        +AuthService
        +UserService
        +ProductService
        +FarmService
        +PriceService
        +NotificationsService
        +AgriAIService
        +WeatherService
    }

    class PostgreSQL {
        +User
        +Product
        +Farm
        +Price
        +Notification
        +Chat
    }

    class AgriAIService_Python {
        +CropRecommenderService
        +PriceForecasterService
        +GeminiService
    }

    WebClient --> ExpressAPI : REST /api
    MobileClient --> ExpressAPI : REST /api
    ExpressAPI --> ServiceLayer
    ServiceLayer --> PostgreSQL : Prisma ORM
    ServiceLayer --> AgriAIService_Python : HTTP proxy
```

### Copy-paste: PlantUML

```plantuml
@startuml AgriMarket_System_Architecture

package "Presentation Layer" {
  class WebClient {
    Next.js + React
  }
  class MobileClient {
    Flutter app
  }
}

package "Application Layer" {
  class ExpressAPI {
    REST routes /api/*
  }
  class ServiceLayer {
    Auth, User, Product
    Farm, Price, Chat
    Notifications, AgriAI
  }
}

package "Data Layer" {
  class PostgreSQL {
    Prisma models
  }
}

package "AI Layer" {
  class AgriAI {
    Crop recommender
    Price forecaster
    Gemini chat
  }
}

WebClient --> ExpressAPI
MobileClient --> ExpressAPI
ExpressAPI --> ServiceLayer
ServiceLayer --> PostgreSQL
ServiceLayer --> AgriAI

@enduml
```

---

## Entity relationship summary (for caption text in your doc)

| Entity | Description | Key relationships |
|--------|-------------|-------------------|
| **User** | Farmer, Trader, or Admin account | Owns Products and Farms; has Chats and Notifications |
| **Product** | Crop listing posted by a farmer | Belongs to one User (farmer) |
| **Farm** | Farmer land plot with soil/climate data | Belongs to one User (farmer); used for AI recommendations |
| **Price** | Historical market price record | Standalone reference data (crop + region + month) |
| **Notification** | In-app alert | Belongs to one User |
| **Chat** | AI assistant conversation history | Belongs to one User |

---

## Which format to use in your doc

- **Google Docs / Word**: Paste **PlantUML** into [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/) → export PNG/SVG → insert image. Or use a Mermaid add-on if installed.
- **Notion / GitHub / Markdown thesis**: Paste **Mermaid** directly inside a ` ```mermaid ` code block.
- **draw.io**: Import PlantUML or recreate from Diagram 1 manually.

No code changes are required — this is documentation-only output ready to copy.
