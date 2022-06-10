package api.app.astrodao.com.core.dto.cli.vote;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(staticName = "of")
public class VoteDto {
	private Integer id;
	private String action;
}