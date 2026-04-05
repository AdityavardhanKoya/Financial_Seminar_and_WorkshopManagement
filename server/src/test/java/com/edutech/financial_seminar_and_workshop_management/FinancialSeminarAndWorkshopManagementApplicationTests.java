package com.edutech.financial_seminar_and_workshop_management;

import com.edutech.financial_seminar_and_workshop_management.dto.LoginRequest;
import com.edutech.financial_seminar_and_workshop_management.entity.*;
import com.edutech.financial_seminar_and_workshop_management.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import javax.transaction.Transactional;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional
class FinancialSeminarAndWorkshopManagementApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private EventRepository eventRepository;

	@Autowired
	private ResourceRepository resourceRepository;

	@Autowired
	private EnrollmentRepository enrollmentRepository;

	@Autowired
	private FeedbackRepository feedbackRepository;

	@BeforeEach
	public void setUp() {
		// Clear the database before each test
		userRepository.deleteAll();
		eventRepository.deleteAll();
		enrollmentRepository.deleteAll();
		feedbackRepository.deleteAll();
		resourceRepository.deleteAll();
	}

	@Test
	public void testRegisterUser() throws Exception {
		String user = "{\n" +
				"    \"username\": \"testUser\",\n" +
				"    \"password\": \"testPassword\",\n" +
				"    \"email\": \"test@example.com\",\n" +
				"    \"role\": \"INSTITUTION\"\n" +
				"}";

		// Perform a POST request to the /register endpoint using MockMvc
		mockMvc.perform(post("/api/user/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(user))
				.andExpect(jsonPath("$.username").value("testUser"))
				.andExpect(jsonPath("$.email").value("test@example.com"))
				.andExpect(jsonPath("$.role").value("INSTITUTION"));

		// Assert business is created in the database
		User savedUser = userRepository.findAll().get(0);
		assertEquals("testUser", savedUser.getUsername());
		assertEquals("test@example.com", savedUser.getEmail());
		assertEquals("INSTITUTION", savedUser.getRole());
	}

	@Test
	public void testLoginUser() throws Exception {
		String user = "{\n" +
				"    \"username\": \"testUser\",\n" +
				"    \"password\": \"testPassword\",\n" +
				"    \"email\": \"test@example.com\",\n" +
				"    \"role\": \"INSTITUTION\"\n" +
				"}";

		// Perform a POST request to the /register endpoint using MockMvc
		mockMvc.perform(post("/api/user/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(user));
		// Login with the registered user
		LoginRequest loginRequest = new LoginRequest("testUser", "testPassword");

		mockMvc.perform(post("/api/user/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(loginRequest)))
				.andExpect(jsonPath("$.token").exists());
	}

	@Test
	public void testLoginWithWrongUsernameOrPassword() throws Exception {
		// Create a login request with a wrong username
		LoginRequest loginRequest = new LoginRequest("wronguser", "password");

		mockMvc.perform(post("/api/user/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(loginRequest)))
				.andExpect(status().isUnauthorized()); // Expect a 401 Unauthorized response
	}


	@Test
	@WithMockUser(username = "testInstitution", authorities = {"INSTITUTION"})
	void testInstitutionShouldCreateEvent() throws Exception {
		// Create an event object
		Event event = new Event();
		event.setInstitutionId(1L);
		event.setTitle("Investment Seminar");
		event.setDescription("A seminar on investment strategies.");
		event.setSchedule("2024-10-10 10:00");
		event.setLocation("New York");
		event.setStatus("Scheduled");

		// Convert the event object to JSON
		String eventJson = objectMapper.writeValueAsString(event);

		// Perform POST request to create the event
		mockMvc.perform(post("/api/institution/event")
						.contentType(MediaType.APPLICATION_JSON)
						.content(eventJson))
				.andExpect(jsonPath("$.title").value("Investment Seminar"))
				.andExpect(jsonPath("$.description").value("A seminar on investment strategies."))
				.andExpect(jsonPath("$.schedule").value("2024-10-10 10:00"))
				.andExpect(jsonPath("$.location").value("New York"))
				.andExpect(jsonPath("$.status").value("Scheduled"));

		// Verify the event is saved in the repository
		List<Event> events = eventRepository.findAll();
		assertEquals(1, events.size());
		assertEquals("Investment Seminar", events.get(0).getTitle());
		assertEquals("A seminar on investment strategies.", events.get(0).getDescription());
	}

	@Test
	@WithMockUser(username = "testInstitution", authorities = {"INSTITUTION"})
	void testInstitutionShouldUpdateEvent() throws Exception {
		// First, create and save an event in the repository
		Event event = new Event();
		event.setInstitutionId(1L);
		event.setTitle("Investment Seminar");
		event.setDescription("A seminar on investment strategies.");
		event.setSchedule("2024-10-10 10:00");
		event.setLocation("New York");
		event.setStatus("Scheduled");
		event = eventRepository.save(event);

		// Update the event details
		Event updatedEvent = new Event();
		updatedEvent.setTitle("Advanced Investment Seminar");
		updatedEvent.setDescription("An advanced seminar on investment strategies.");
		updatedEvent.setSchedule("2024-11-15 15:00");
		updatedEvent.setLocation("San Francisco");
		updatedEvent.setStatus("Updated");

		// Convert the updated event object to JSON
		String updatedEventJson = objectMapper.writeValueAsString(updatedEvent);

		// Perform PUT request to update the event
		mockMvc.perform(put("/api/institution/event/" + event.getId())
						.contentType(MediaType.APPLICATION_JSON)
						.content(updatedEventJson))
				.andExpect(jsonPath("$.title").value("Advanced Investment Seminar"))
				.andExpect(jsonPath("$.description").value("An advanced seminar on investment strategies."))
				.andExpect(jsonPath("$.schedule").value("2024-11-15 15:00"))
				.andExpect(jsonPath("$.location").value("San Francisco"))
				.andExpect(jsonPath("$.status").value("Updated"));

		// Verify the event is updated in the repository
		Event retrievedEvent = eventRepository.findById(event.getId()).get();
		assertEquals("Advanced Investment Seminar", retrievedEvent.getTitle());
		assertEquals("An advanced seminar on investment strategies.", retrievedEvent.getDescription());
		assertEquals("2024-11-15 15:00", retrievedEvent.getSchedule());
		assertEquals("San Francisco", retrievedEvent.getLocation());
		assertEquals("Updated", retrievedEvent.getStatus());
	}

	@Test
	@WithMockUser(username = "testInstitution", authorities = {"INSTITUTION"})
	void testInstitutionShouldGetEvents() throws Exception {
		// Create and save events in the repository
		Event event1 = new Event();
		event1.setInstitutionId(1L);
		event1.setTitle("Investment Seminar");
		event1.setDescription("A seminar on investment strategies.");
		event1.setSchedule("2024-10-10 10:00");
		event1.setLocation("New York");
		event1.setStatus("Scheduled");
		eventRepository.save(event1);

		Event event2 = new Event();
		event2.setInstitutionId(1L);
		event2.setTitle("Financial Planning Workshop");
		event2.setDescription("A workshop on financial planning.");
		event2.setSchedule("2024-12-01 09:00");
		event2.setLocation("Chicago");
		event2.setStatus("Scheduled");
		eventRepository.save(event2);

		// Perform GET request to retrieve events for institution
		mockMvc.perform(get("/api/institution/events")
						.param("institutionId", "1"))
				.andExpect(jsonPath("$[0].title").value("Investment Seminar"))
				.andExpect(jsonPath("$[0].description").value("A seminar on investment strategies."))
				.andExpect(jsonPath("$[1].title").value("Financial Planning Workshop"))
				.andExpect(jsonPath("$[1].description").value("A workshop on financial planning."));
	}

	@Test
	@WithMockUser(username = "testInstitution", authorities = {"INSTITUTION"})
	void testAddResourceToEvent() throws Exception {
		// First, create and save an event in the repository
		Event event = new Event();
		event.setInstitutionId(1L);
		event.setTitle("Investment Seminar");
		event.setDescription("A seminar on investment strategies.");
		event.setSchedule("2024-10-10 10:00");
		event.setLocation("New York");
		event.setStatus("Scheduled");
		eventRepository.save(event);

		// Create a resource object
		Resource resource = new Resource();
		resource.setType("Projector");
		resource.setDescription("High-definition projector for presentations.");
		resource.setAvailabilityStatus("Available");

		// Convert the resource object to JSON
		String resourceJson = objectMapper.writeValueAsString(resource);

		// Perform POST request to add the resource to the event
		mockMvc.perform(post("/api/institution/event/" + event.getId() + "/resource")
						.contentType(MediaType.APPLICATION_JSON)
						.content(resourceJson))
				.andExpect(jsonPath("$.type").value("Projector"))
				.andExpect(jsonPath("$.description").value("High-definition projector for presentations."))
				.andExpect(jsonPath("$.availabilityStatus").value("Available"));

		// Verify the resource is saved and associated with the event in the repository
		List<Resource> resources = resourceRepository.findAll();
		assertEquals(1, resources.size());
		assertEquals("Projector", resources.get(0).getType());
		assertEquals("High-definition projector for presentations.", resources.get(0).getDescription());
		assertEquals("Available", resources.get(0).getAvailabilityStatus());
		assertEquals(event.getId(), resources.get(0).getEvent().getId());
	}

	@Test
	@WithMockUser(username = "testInstitution", authorities = {"INSTITUTION"})
	void testGetProfessionalsList() throws Exception {
		// Create and save a few User objects with the "PROFESSIONAL" role
		User professional1 = new User();
		professional1.setUsername("professional1");
		professional1.setPassword("password");
		professional1.setEmail("pro1@example.com");
		professional1.setRole("PROFESSIONAL");
		userRepository.save(professional1);

		User professional2 = new User();
		professional2.setUsername("professional2");
		professional2.setPassword("password");
		professional2.setEmail("pro2@example.com");
		professional2.setRole("PROFESSIONAL");
		userRepository.save(professional2);

		// Perform GET request to retrieve the list of professionals
		mockMvc.perform(get("/api/institution/event/professionals"))
				.andExpect(jsonPath("$[0].username").value("professional1"))
				.andExpect(jsonPath("$[0].role").value("PROFESSIONAL"))
				.andExpect(jsonPath("$[1].username").value("professional2"))
				.andExpect(jsonPath("$[1].role").value("PROFESSIONAL"));
	}

	@Test
	@WithMockUser(username = "testInstitution", authorities = {"INSTITUTION"})
	void testAssignProfessionalToEvent() throws Exception {
		// First, create and save an event in the repository
		Event event = new Event();
		event.setInstitutionId(1L);
		event.setTitle("Investment Seminar");
		event.setDescription("A seminar on investment strategies.");
		event.setSchedule("2024-10-10 10:00");
		event.setLocation("New York");
		event.setStatus("Scheduled");
		eventRepository.save(event);

		// Create and save a User object with the "PROFESSIONAL" role
		User professional = new User();
		professional.setUsername("professional");
		professional.setPassword("password");
		professional.setEmail("pro@example.com");
		professional.setRole("PROFESSIONAL");
		userRepository.save(professional);

		// Perform POST request to assign the professional to the event
		mockMvc.perform(post("/api/institution/event/" + event.getId() + "/professional")
						.param("userId", professional.getId().toString()));

		// Verify that the professional is now associated with the event
		Event updatedEvent = eventRepository.findById(event.getId()).orElseThrow();
		assertEquals(1, updatedEvent.getProfessionals().size());
		assertEquals(professional.getId(), updatedEvent.getProfessionals().get(0).getId());
	}

	@Test
	@WithMockUser(username = "testProfessional", authorities = {"PROFESSIONAL"})
	void testProfessionalsShouldViewAssignedEvents() throws Exception {
		// Create and save a user with the role "PROFESSIONAL"
		User professional = new User();
		professional.setUsername("professional");
		professional.setPassword("password");
		professional.setEmail("pro@example.com");
		professional.setRole("PROFESSIONAL");
		userRepository.save(professional);

		// Create and save events and assign them to the professional
		Event event1 = new Event();
		event1.setInstitutionId(1L);
		event1.setTitle("Seminar 1");
		event1.setDescription("Finance Seminar 1");
		event1.setSchedule("2024-09-15 09:00");
		event1.setLocation("London");
		event1.setStatus("Scheduled");
		event1.getProfessionals().add(professional);
		eventRepository.save(event1);

		Event event2 = new Event();
		event2.setInstitutionId(2L);
		event2.setTitle("Seminar 2");
		event2.setDescription("Finance Seminar 2");
		event2.setSchedule("2024-10-20 10:00");
		event2.setLocation("New York");
		event2.setStatus("Scheduled");
		event2.getProfessionals().add(professional);
		eventRepository.save(event2);

		professional.getEvents().add(event1);
		professional.getEvents().add(event2);
		userRepository.save(professional);

		// Perform GET request to view assigned events
		mockMvc.perform(get("/api/professional/events")
						.param("userId", professional.getId().toString()))
				.andExpect(jsonPath("$[0].title").value("Seminar 1"))
				.andExpect(jsonPath("$[1].title").value("Seminar 2"));
	}

	@Test
	@WithMockUser(username = "testProfessional", authorities = {"PROFESSIONAL"})
	void testProfessionalsShouldProvideFeedback() throws Exception {
		// Create and save a user with the role "PROFESSIONAL"
		User professional = new User();
		professional.setUsername("professional");
		professional.setPassword("password");
		professional.setEmail("pro@example.com");
		professional.setRole("PROFESSIONAL");
		userRepository.save(professional);

		// Create and save an event
		Event event = new Event();
		event.setInstitutionId(1L);
		event.setTitle("Finance Workshop");
		event.setDescription("A workshop on financial modeling.");
		event.setSchedule("2024-11-01 10:00");
		event.setLocation("San Francisco");
		event.setStatus("Scheduled");
		eventRepository.save(event);

		// Create feedback object
		Feedback feedback = new Feedback();
		feedback.setContent("Great workshop, very informative.");
		feedback.setTimestamp(new Date());

		// Perform POST request to provide feedback
		mockMvc.perform(post("/api/professional/event/" + event.getId() + "/feedback")
						.param("userId", professional.getId().toString())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(feedback)));

		// Verify that the feedback was saved in the database
		List<Feedback> feedbackList = feedbackRepository.findAll();
		assertEquals(1, feedbackList.size());
		assertEquals("Great workshop, very informative.", feedbackList.get(0).getContent());
		assertEquals(professional.getId(), feedbackList.get(0).getUser().getId());
		assertEquals(event.getId(), feedbackList.get(0).getEvent().getId());
	}

	@Test
	@WithMockUser(username = "testParticipant", authorities = {"PARTICIPANT"})
	void testParticipantShouldGetAllEvents() throws Exception {
		// Create and save some events
		Event event1 = new Event();
		event1.setInstitutionId(1L);
		event1.setTitle("Finance Seminar 101");
		event1.setDescription("Introduction to Finance.");
		event1.setSchedule("2024-09-20 10:00");
		event1.setLocation("New York");
		event1.setStatus("Scheduled");
		eventRepository.save(event1);

		Event event2 = new Event();
		event2.setInstitutionId(2L);
		event2.setTitle("Advanced Investment Strategies");
		event2.setDescription("Deep dive into investment strategies.");
		event2.setSchedule("2024-10-25 14:00");
		event2.setLocation("London");
		event2.setStatus("Scheduled");
		eventRepository.save(event2);

		// Perform GET request to retrieve all events
		mockMvc.perform(get("/api/participant/events"))
				.andExpect(jsonPath("$[0].title").value("Finance Seminar 101"))
				.andExpect(jsonPath("$[1].title").value("Advanced Investment Strategies"));
	}

	@Test
	@WithMockUser(username = "testParticipant", authorities = {"PARTICIPANT"})
	void testParticipantShouldEnrollInEvent() throws Exception {
		// Create and save a user with the role "PARTICIPANT"
		User participant = new User();
		participant.setUsername("participant");
		participant.setPassword("password");
		participant.setEmail("participant@example.com");
		participant.setRole("PARTICIPANT");
		userRepository.save(participant);

		// Create and save an event
		Event event = new Event();
		event.setInstitutionId(1L);
		event.setTitle("Finance Workshop");
		event.setDescription("A workshop on financial planning.");
		event.setSchedule("2024-09-30 09:00");
		event.setLocation("San Francisco");
		event.setStatus("Scheduled");
		eventRepository.save(event);

		// Perform POST request to enroll in the event
		mockMvc.perform(post("/api/participant/event/" + event.getId() + "/enroll")
						.param("userId", participant.getId().toString()));

		// Verify that the enrollment was saved in the database
		List<Enrollment> enrollments = enrollmentRepository.findAll();
		assertEquals(1, enrollments.size());
		assertEquals(event.getId(), enrollments.get(0).getEvent().getId());
		assertEquals(participant.getId(), enrollments.get(0).getUser().getId());
	}

	@Test
	@WithMockUser(username = "testParticipant", authorities = {"PARTICIPANT"})
	void testParticipantShouldViewEventStatus() throws Exception {
		// Create and save an event
		Event event = new Event();
		event.setInstitutionId(1L);
		event.setTitle("Investment Seminar");
		event.setDescription("Learn the basics of investment.");
		event.setSchedule("2024-11-15 09:00");
		event.setLocation("Los Angeles");
		event.setStatus("Scheduled");
		eventRepository.save(event);

		// Perform GET request to view the status of the event
		mockMvc.perform(get("/api/participant/event/" + event.getId() + "/status"))
				.andExpect(jsonPath("$.title").value("Investment Seminar"))
				.andExpect(jsonPath("$.status").value("Scheduled"));
	}

	@Test
	@WithMockUser(username = "testParticipant", authorities = {"PARTICIPANT"})
	void testParticipantShouldProvideFeedback() throws Exception {
		// Create and save a user with the role "PARTICIPANT"
		User participant = new User();
		participant.setUsername("participant");
		participant.setPassword("password");
		participant.setEmail("participant@example.com");
		participant.setRole("PARTICIPANT");
		userRepository.save(participant);

		// Create and save an event
		Event event = new Event();
		event.setInstitutionId(1L);
		event.setTitle("Finance Workshop");
		event.setDescription("A workshop on financial strategies.");
		event.setSchedule("2024-12-10 10:00");
		event.setLocation("Miami");
		event.setStatus("Completed");
		eventRepository.save(event);

		// Prepare feedback data
		Feedback feedback = new Feedback();
		feedback.setContent("Great workshop, very informative.");
		feedback.setTimestamp(new Date());

		// Perform POST request to provide feedback for the event
		mockMvc.perform(post("/api/participant/event/" + event.getId() + "/feedback")
						.param("userId", participant.getId().toString())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(feedback)));

		// Verify that the feedback was saved in the database
		List<Feedback> feedbacks = feedbackRepository.findAll();
		assertEquals(1, feedbacks.size());
		assertEquals("Great workshop, very informative.", feedbacks.get(0).getContent());
		assertEquals(participant.getId(), feedbacks.get(0).getUser().getId());
		assertEquals(event.getId(), feedbacks.get(0).getEvent().getId());
	}

	@Test
	@WithMockUser(authorities = {"PROFESSIONAL", "PARTICIPANT"})
	public void testInstitutionApiShouldBeForbiddenForOtherUser() throws Exception {
		mockMvc.perform(post("/api/institution/event"))
				.andExpect(status().isForbidden());

		mockMvc.perform(put("/api/institution/event/1"))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/api/institution/events"))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/api/institution/event/1/resource"))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/api/institution/event/professionals"))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/api/institution/event/1/professional"))
				.andExpect(status().isForbidden());
	}

	@Test
	@WithMockUser(authorities = {"INSTITUTION", "PARTICIPANT"})
	public void testProfessionalsApiShouldBeForbiddenForOtherUser() throws Exception {
		mockMvc.perform(get("/api/professional/events"))
				.andExpect(status().isForbidden());

		mockMvc.perform(put("/api/professional/event/1/status"))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/api/professional/event/1/feedback"))
				.andExpect(status().isForbidden());
	}

	@Test
	@WithMockUser(authorities = {"INSTITUTION", "PROFESSIONAL"})
	public void testParticipantApiShouldBeForbiddenForOtherUser() throws Exception {
		mockMvc.perform(get("/api/participant/events"))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/api/participant/event/1/enroll"))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/api/participant/event/1/status"))
				.andExpect(status().isForbidden());

		mockMvc.perform(post("/api/participant/event/1/feedback"))
				.andExpect(status().isForbidden());
	}
}
